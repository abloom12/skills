import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  access, chmod, lstat, mkdir, readFile, readdir, rename, unlink, writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import type {
  ExtensionAPI,
  ExtensionCommandContext,
} from "@earendil-works/pi-coding-agent";

const execFileAsync = promisify(execFile);

const trackerTemplates: Record<string, string> = {
  GitHub: "issue-tracker-github.md",
  GitLab: "issue-tracker-gitlab.md",
  "Backlog.md": "issue-tracker-backlog.md",
  "Local Markdown (.scratch/)": "issue-tracker-local.md",
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readExisting(path: string): Promise<string | undefined> {
  try {
    const stat = await lstat(path);
    if (!stat.isFile()) throw new Error(`${path} is not a regular file`);
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

type SetupFileDraft = {
  path: string;
  original: string | undefined;
  content: string;
};

async function verifyDraftTargets(
  cwd: string,
  guidanceFile: "CLAUDE.md" | "AGENTS.md",
  drafts: SetupFileDraft[],
) {
  for (const dir of [join(cwd, "docs"), join(cwd, "docs", "agents")]) {
    try {
      if (!(await lstat(dir)).isDirectory()) {
        throw new Error(`${dir} is not a regular directory`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  if (
    guidanceFile === "AGENTS.md" &&
    (await readExisting(join(cwd, "CLAUDE.md"))) !== undefined
  ) {
    throw new Error("CLAUDE.md appeared; rerun setup to use the existing file");
  }

  for (const draft of drafts) {
    if ((await readExisting(draft.path)) !== draft.original) {
      throw new Error(`${draft.path} changed while setup was in progress`);
    }
  }
}

async function writeDraftAtomically(draft: SetupFileDraft) {
  const tempPath = join(dirname(draft.path), `.setup-skill-${randomUUID()}.tmp`);
  let replaced = false;
  try {
    const prior =
      draft.original === undefined ? undefined : await lstat(draft.path);
    if (prior && !prior.isFile()) {
      throw new Error(`${draft.path} is not a regular file`);
    }
    const mode = prior ? prior.mode & 0o777 : 0o666;
    await writeFile(tempPath, draft.content, { flag: "wx", mode });
    if (prior) await chmod(tempPath, mode);

    if ((await readExisting(draft.path)) !== draft.original) {
      throw new Error(`${draft.path} changed before it could be written`);
    }
    await rename(tempPath, draft.path);
    replaced = true;
  } finally {
    if (!replaced) await unlink(tempPath).catch(() => {});
  }
}

async function inspectTrackers(ctx: ExtensionCommandContext) {
  const backlogConfigPaths = [
    "backlog.config.yml",
    "backlog/config.yml",
    ".backlog/config.yml",
  ];

  const [remotes, configChecks] = await Promise.all([
    execFileAsync("git", ["remote", "-v"], { cwd: ctx.cwd })
      .then(({ stdout }: { stdout: string }) => stdout)
      .catch(() => ""),
    Promise.all(
      backlogConfigPaths.map(async (path) => ({
        path,
        exists: await fileExists(join(ctx.cwd, path)),
      })),
    ),
  ]);

  const backlogConfig = configChecks.find((check) => check.exists)?.path;
  const hasGitHub = /\bgithub\.com[:/]/i.test(remotes);
  const hasGitLab = /\bgitlab\.com[:/]/i.test(remotes);

  const choices: string[] = [];

  if (hasGitHub) choices.push("GitHub");
  if (hasGitLab) choices.push("GitLab");
  if (backlogConfig) choices.push("Backlog.md");

  // Keep detected trackers first, but allow either hosted tracker by choice.
  if (!hasGitHub) choices.push("GitHub");
  if (!hasGitLab) choices.push("GitLab");
  choices.push("Local Markdown (.scratch/)", "Other");

  return {
    choices,
    tracker: { github: hasGitHub, gitlab: hasGitLab, backlog: backlogConfig },
  };
}

async function inspectPriorSetup(cwd: string) {
  const guidance = await Promise.all(
    ["CLAUDE.md", "AGENTS.md"].map(async (name) => {
      try {
        const content = await readFile(join(cwd, name), "utf8");
        const hasHeading = content
          .split(/\r?\n/)
          .some((line) => line.trim() === "## Agent skills");
        return `${name}: found; Agent skills heading candidate: ${hasHeading ? "yes" : "no"}`;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return `${name}: not found`;
        }
        throw error;
      }
    }),
  );

  let agentDocs: string[];
  try {
    agentDocs = await readdir(join(cwd, "docs", "agents"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    agentDocs = [];
  }

  return {
    guidance,
    agentDocs,
    hasScratch: await fileExists(join(cwd, ".scratch")),
  };
}

async function inspectDomain(cwd: string) {
  const [hasContext, hasMap, hasRootAdrs, hasPnpmWorkspace] = await Promise.all(
    [
      fileExists(join(cwd, "CONTEXT.md")),
      fileExists(join(cwd, "CONTEXT-MAP.md")),
      fileExists(join(cwd, "docs", "adr")),
      fileExists(join(cwd, "pnpm-workspace.yaml")),
    ],
  );

  let hasPackageWorkspaces = false;
  try {
    const pkg = JSON.parse(await readFile(join(cwd, "package.json"), "utf8"));
    const workspaces = pkg.workspaces;
    hasPackageWorkspaces = Array.isArray(workspaces)
      ? workspaces.length > 0
      : Array.isArray(workspaces?.packages) && workspaces.packages.length > 0;
  } catch {
    // A package.json isn't required.
  }

  let packagesWithSrc = 0;
  try {
    const packagesDir = join(cwd, "packages");
    const entries = await readdir(packagesDir, { withFileTypes: true });
    const checks = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => fileExists(join(packagesDir, entry.name, "src"))),
    );
    packagesWithSrc = checks.filter(Boolean).length;
  } catch {
    // A packages/ directory isn't required.
  }

  let contextAdrs: string[] = [];
  try {
    const srcDir = join(cwd, "src");
    const entries = await readdir(srcDir, { withFileTypes: true });
    const checks = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => ({
          name: entry.name,
          hasAdrs: await fileExists(join(srcDir, entry.name, "docs", "adr")),
        })),
    );
    contextAdrs = checks
      .filter((check) => check.hasAdrs)
      .map((check) => `src/${check.name}/docs/adr/`);
  } catch {
    // A src/ directory isn't required.
  }

  const monorepoSignals: string[] = [];
  if (hasPnpmWorkspace) monorepoSignals.push("pnpm-workspace.yaml");
  if (hasPackageWorkspaces) monorepoSignals.push("package.json workspaces");
  if (packagesWithSrc >= 2) {
    monorepoSignals.push(`${packagesWithSrc} packages with src/`);
  }

  return { hasContext, hasMap, hasRootAdrs, contextAdrs, monorepoSignals };
}
async function selectDomainLayout(
  ctx: ExtensionCommandContext,
  domain: Awaited<ReturnType<typeof inspectDomain>>,
) {
  let layout: "single-context" | "multi-context" =
    domain.hasMap ? "multi-context" : "single-context";

  if (!domain.hasMap && domain.monorepoSignals.length > 0) {
    const choice = await ctx.ui.select("Domain documentation layout", [
      "Single-context (recommended)",
      "Multi-context",
    ]);
    if (!choice) return;
    if (choice === "Multi-context") layout = "multi-context";
  }

  ctx.ui.notify(`Proposed domain layout: ${layout}`, "info");
  return layout;
}
async function selectGuidanceFile(ctx: ExtensionCommandContext) {
  const hasClaude = await fileExists(join(ctx.cwd, "CLAUDE.md"));
  const hasAgents = await fileExists(join(ctx.cwd, "AGENTS.md"));

  let guidanceFile: "CLAUDE.md" | "AGENTS.md";

  if (hasClaude) {
    guidanceFile = "CLAUDE.md";
  } else if (hasAgents) {
    guidanceFile = "AGENTS.md";
  } else {
    const choice = await ctx.ui.select(
      "Which root guidance file should setup create?",
      ["AGENTS.md", "CLAUDE.md"],
    );

    if (!choice) return undefined;
    guidanceFile = choice as "CLAUDE.md" | "AGENTS.md";
  }

  return guidanceFile;
}

type DomainLayout = "single-context" | "multi-context";
function buildAgentSkillsBlock(tracker: string, layout: DomainLayout): string {
  const trackerSummary =
    tracker === "Other"
      ? "This repo uses a custom issue tracker"
      : `${tracker} is the issue tracker for this repo`;

  return [
    "## Agent skills",
    "",
    "### Issue tracker",
    "",
    `${trackerSummary}. See \`docs/agents/issue-tracker.md\`.`,
    "",
    "### Domain docs",
    "",
    `This repo uses a ${layout} domain-doc layout. See \`docs/agents/domain.md\`.`,
    "",
  ].join("\n");
}

function findAgentSkillsSection(
  existing: string,
): { start: number; end: number } | undefined {
  const lines = existing.split("\n");
  let offset = 0;
  let start: number | undefined;
  let end: number | undefined;
  let fence: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, "");
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);

    if (fence) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence[0] &&
        fenceMatch[1].length >= fence.length &&
        !fenceMatch[2].trim()
      ) {
        fence = undefined;
      }
    } else if (
      fenceMatch &&
      (fenceMatch[1][0] === "~" || !fenceMatch[2].includes("`"))
    ) {
      fence = fenceMatch[1];
    } else {
      const heading = /^ {0,3}(#{1,2})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/.exec(line);
      if (heading) {
        if (heading[1] === "##" && heading[2] === "Agent skills") {
          if (start !== undefined) {
            throw new Error("Multiple ## Agent skills sections found");
          }
          start = offset;
        } else if (start !== undefined && end === undefined) {
          end = offset;
        }
      }
    }

    offset += lines[i].length + (i < lines.length - 1 ? 1 : 0);
  }

  return start === undefined
    ? undefined
    : { start, end: end ?? existing.length };
}

function mergeAgentSkillsBlock(existing: string, block: string): string {
  const newline = existing.includes("\r\n") ? "\r\n" : "\n";
  const cleanBlock = block.trimEnd().replace(/\r?\n/g, newline);
  const section = findAgentSkillsSection(existing);

  if (!section) {
    if (!existing) return `${cleanBlock}${newline}`;
    const separator = existing.endsWith(`${newline}${newline}`)
      ? ""
      : existing.endsWith(newline)
        ? newline
        : `${newline}${newline}`;
    return `${existing}${separator}${cleanBlock}${newline}`;
  }

  const suffix = existing.slice(section.end);
  return (
    existing.slice(0, section.start) +
    cleanBlock +
    (suffix ? `${newline}${newline}` : newline) +
    suffix
  );
}

async function previewTemplate(
  ctx: ExtensionCommandContext,
  packageRoot: string,
  templateName: string,
  targetPath: string,
  existing: string | undefined,
) {
  const templatePath = join(packageRoot, "templates", templateName);

  let content: string;
  try {
    if (existing !== undefined) {
      const source = await ctx.ui.select(`Draft ${targetPath} from:`, [
        "Edit existing file",
        "Start from template",
      ]);
      if (!source) return;
      content =
        source === "Edit existing file"
          ? existing
          : await readFile(templatePath, "utf8");
    } else {
      content = await readFile(templatePath, "utf8");
    }
  } catch (error) {
    ctx.ui.notify(`Could not prepare ${targetPath}: ${String(error)}`, "error");
    return;
  }

  try {
    return await ctx.ui.editor(`Preview ${targetPath} (not saved)`, content);
  } catch (error) {
    ctx.ui.notify(`Could not preview ${targetPath}: ${String(error)}`, "error");
    return undefined;
  }
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("setup-skill", {
    description: "Configure this repo for the engineering skills",
    handler: async (_args: any, ctx: ExtensionCommandContext) => {
      if (ctx.mode !== "tui") {
        ctx.ui.notify("/setup-skill requires Pi's interactive TUI", "error");
        return;
      }

      const { choices, tracker } = await inspectTrackers(ctx);
      let priorSetup: Awaited<ReturnType<typeof inspectPriorSetup>>;
      let domain: Awaited<ReturnType<typeof inspectDomain>>;
      try {
        priorSetup = await inspectPriorSetup(ctx.cwd);
        domain = await inspectDomain(ctx.cwd);
      } catch (error) {
        ctx.ui.notify(`Could not inspect repo: ${String(error)}`, "error");
        return;
      }

      ctx.ui.notify(
        [
          `Project: ${ctx.cwd}`,
          `GitHub remote: ${tracker.github ? "found" : "not found"}`,
          `GitLab remote: ${tracker.gitlab ? "found" : "not found"}`,
          `Backlog.md config: ${tracker.backlog ?? "not found"}`,
          ...priorSetup.guidance,
          `Existing docs/agents/ files: ${priorSetup.agentDocs.join(", ") || "none"}`,
          `.scratch/: ${priorSetup.hasScratch ? "found" : "not found"}`,
          `Root CONTEXT.md: ${domain.hasContext ? "found" : "not found"}`,
          `Root CONTEXT-MAP.md: ${domain.hasMap ? "found" : "not found"}`,
          `Root docs/adr/: ${domain.hasRootAdrs ? "found" : "not found"}`,
          `Context ADR directories: ${domain.contextAdrs.join(", ") || "none"}`,
          `Monorepo signals: ${domain.monorepoSignals.join(", ") || "none"}`,
        ].join("\n"),
        "info",
      );

      const selected = await ctx.ui.select("Choose an issue tracker", choices);
      if (!selected) return;

      // Finish the choices before presenting drafts for editing.
      const layout = await selectDomainLayout(ctx, domain);
      if (layout === undefined) return;

      // Read templates from this package, not the consuming repo.
      const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
      const trackerPath = join(ctx.cwd, "docs", "agents", "issue-tracker.md");
      let trackerExisting: string | undefined;
      try {
        trackerExisting = await readExisting(trackerPath);
      } catch (error) {
        ctx.ui.notify(`Could not read ${trackerPath}: ${String(error)}`, "error");
        return;
      }

      let trackerDraft: string | undefined;
      if (selected === "Other") {
        try {
          const description = await ctx.ui.editor(
            "Describe your issue tracker workflow (one paragraph; not saved)",
            "",
          );
          if (description === undefined) return;
          if (!description.trim()) {
            ctx.ui.notify("A tracker description is required.", "error");
            return;
          }
          trackerDraft = await ctx.ui.editor(
            "Preview docs/agents/issue-tracker.md (not saved)",
            `# Issue tracker\n\n${description.trim()}\n`,
          );
        } catch (error) {
          ctx.ui.notify(`Could not preview custom tracker: ${String(error)}`, "error");
          return;
        }
      } else {
        const templateName = trackerTemplates[selected];
        if (!templateName) {
          ctx.ui.notify(`No template for ${selected}`, "error");
          return;
        }
        trackerDraft = await previewTemplate(
          ctx,
          packageRoot,
          templateName,
          "docs/agents/issue-tracker.md",
          trackerExisting,
        );
      }
      if (trackerDraft === undefined) return;

      ctx.ui.notify(`Previewed ${selected}; no files were written.`, "info");

      // One domain template describes both possible layouts.
      const domainPath = join(ctx.cwd, "docs", "agents", "domain.md");
      let domainExisting: string | undefined;
      try {
        domainExisting = await readExisting(domainPath);
      } catch (error) {
        ctx.ui.notify(`Could not read ${domainPath}: ${String(error)}`, "error");
        return;
      }
      const domainDraft = await previewTemplate(
        ctx,
        packageRoot,
        "domain.md",
        "docs/agents/domain.md",
        domainExisting,
      );
      if (domainDraft === undefined) return;

      ctx.ui.notify(
        `Previewed ${layout} domain guidance; no files were written.`,
        "info",
      );

      // Match Matt's precedence: reuse an existing CLAUDE.md, then AGENTS.md.
      const guidanceFile = await selectGuidanceFile(ctx);
      if (guidanceFile === undefined) return;

      // This block points skills to the per-repo guidance, without duplicating it.
      const agentSkillsBlock = buildAgentSkillsBlock(selected, layout);

      // Edit the managed block before previewing it in the full root file.
      let guidanceDraft: string | undefined;
      try {
        guidanceDraft = await ctx.ui.editor(
          `Preview ${guidanceFile} Agent skills block (not saved)`,
          agentSkillsBlock,
        );
      } catch (error) {
        ctx.ui.notify(
          `Could not preview ${guidanceFile}: ${String(error)}`,
          "error",
        );
        return;
      }
      if (guidanceDraft === undefined) return;

      ctx.ui.notify(
        `Previewed ${guidanceFile} block; no files were written.`,
        "info",
      );

      const guidancePath = join(ctx.cwd, guidanceFile);
      let existingContent: string | undefined;
      try {
        existingContent = await readExisting(guidancePath);
      } catch (error) {
        ctx.ui.notify(`Could not read ${guidancePath}: ${String(error)}`, "error");
        return;
      }

      let proposedContent: string;
      try {
        proposedContent = mergeAgentSkillsBlock(existingContent ?? "", guidanceDraft);
      } catch (error) {
        ctx.ui.notify(
          `Could not draft ${guidanceFile}: ${String(error)}`,
          "error",
        );
        return;
      }

      let fullGuidanceDraft: string | undefined;
      try {
        fullGuidanceDraft = await ctx.ui.editor(
          `Preview full ${guidanceFile} (not saved)`,
          proposedContent,
        );
      } catch (error) {
        ctx.ui.notify(
          `Could not preview full ${guidanceFile}: ${String(error)}`,
          "error",
        );
        return;
      }
      if (fullGuidanceDraft === undefined) return;

      try {
        const section = findAgentSkillsSection(fullGuidanceDraft);
        const block = section &&
          fullGuidanceDraft.slice(section.start, section.end);
        if (
          !block?.includes("`docs/agents/issue-tracker.md`") ||
          !block.includes("`docs/agents/domain.md`")
        ) {
          throw new Error("The Agent skills section must retain both guidance pointers");
        }
      } catch (error) {
        ctx.ui.notify(`Could not use full ${guidanceFile} draft: ${String(error)}`, "error");
        return;
      }

      const drafts: SetupFileDraft[] = [
        { path: trackerPath, original: trackerExisting, content: trackerDraft },
        { path: domainPath, original: domainExisting, content: domainDraft },
        {
          path: guidancePath,
          original: existingContent,
          content: fullGuidanceDraft,
        },
      ];

      const confirmed = await ctx.ui.confirm(
        "Write the reviewed setup files?",
        `Project: ${ctx.cwd}\n${drafts
          .map((draft) =>
            `${draft.original === undefined ? "Create" : "Update"} ${draft.path}`,
          )
          .join("\n")}`,
      );
      if (!confirmed) {
        ctx.ui.notify("Setup cancelled; no files were written.", "info");
        return;
      }

      const written: string[] = [];
      try {
        await verifyDraftTargets(ctx.cwd, guidanceFile, drafts);
        await mkdir(join(ctx.cwd, "docs", "agents"), { recursive: true });
        for (const draft of drafts) {
          if (draft.content === draft.original) continue;
          await writeDraftAtomically(draft);
          written.push(draft.path);
        }
      } catch (error) {
        ctx.ui.notify(
          `Setup stopped: ${String(error)}\nFiles completed: ${written.join(", ") || "none"}. Check targets and any .setup-skill-*.tmp files before retrying.`, 
          "error",
        );
        return;
      }

      ctx.ui.notify(
        `Setup complete. to-spec, to-tickets, and code-review can read the guidance. You can edit docs/agents/*.md later.`,
        "info",
      );
    },
  });
}
