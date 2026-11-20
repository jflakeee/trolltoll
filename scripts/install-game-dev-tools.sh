#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
git submodule update --init --recursive
if ! command -v claude >/dev/null 2>&1; then
  echo "Claude Code CLI is not installed on this computer."
  echo "Git submodules and the checked-in skills are present, but the two Claude Code plugins still require local installation."
  exit 0
fi
echo "Adding the official GameDev Agent Skills plugin marketplace..."
claude plugin marketplace add gamedev-skills/awesome-gamedev-agent-skills
claude plugin install gamedev@awesome-gamedev-agent-skills --scope project
echo "Adding the official Claude GameDev Kit plugin marketplace..."
claude plugin marketplace add dudwns0921/claude-gamedev-kit
claude plugin install gamedev-kit@claude-gamedev-kit --scope project
echo "Project-scoped plugin commands completed; check 'claude plugin list' and review permissions."
