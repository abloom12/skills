#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

while read -r source skill extra; do
  [[ -z "${source:-}" || "$source" == \#* ]] && continue
  if [[ -z "${skill:-}" || -n "${extra:-}" ]]; then
    printf 'Invalid entry in skill-sources.txt: %s %s %s\n' "$source" "${skill:-}" "${extra:-}" >&2
    exit 1
  fi

  printf 'Installing %s from %s for Pi...\n' "$skill" "$source"
  npx --yes skills add "$source" --skill "$skill" --agent pi --global --yes
done < "$repo_root/skill-sources.txt"
