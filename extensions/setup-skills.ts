import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const sourcesPath = fileURLToPath(new URL("../skill-sources.txt", import.meta.url));
const scriptPath = fileURLToPath(new URL("../scripts/install.sh", import.meta.url));

export default function (pi: ExtensionAPI) {
  pi.registerCommand("setup-skills", {
    description: "Install this package's curated external skills for Pi",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        throw new Error("/setup-skills requires an interactive confirmation UI");
      }

      let entries: string[];
      try {
        const sources = await readFile(sourcesPath, "utf8");
        entries = sources.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
      } catch (error) {
        ctx.ui.notify(`Cannot read skill-sources.txt: ${String(error)}`, "error");
        return;
      }

      if (entries.length === 0) {
        ctx.ui.notify("No external skills listed in skill-sources.txt", "info");
        return;
      }

      const confirmed = await ctx.ui.confirm(
        "Install external skills?",
        `The following entries will be installed globally for Pi:\n\n${entries.join("\n")}\n\nContinue?`,
      );
      if (!confirmed) return;

      try {
        const { code, killed, stdout, stderr } = await pi.exec("bash", [scriptPath]);
        if (code !== 0 || killed) {
          ctx.ui.notify(`External skill installation failed (${code}).\n${(stderr || stdout).slice(-3000)}`, "error");
          return;
        }
        ctx.ui.notify("External skills installed. Run /reload to make them available in this session.", "info");
      } catch (error) {
        ctx.ui.notify(`External skill installation failed: ${String(error)}`, "error");
      }
    },
  });
}
