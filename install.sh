#!/usr/bin/env bash
set -euo pipefail

REPO="JustinasLa/evenhub-app-ui"

if ! command -v node >/dev/null 2>&1; then
  echo "evenhub-app-ui: Node.js 22.20.0 or newer is required." >&2
  exit 1
fi

NODE_VERSION="$(node -p "process.versions.node")"
NODE_MAJOR="${NODE_VERSION%%.*}"
NODE_MINOR="${NODE_VERSION#*.}"
NODE_MINOR="${NODE_MINOR%%.*}"
if [ "$NODE_MAJOR" -lt 22 ] || { [ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -lt 20 ]; }; then
  echo "evenhub-app-ui: Node.js 22.20.0 or newer is required; found $NODE_VERSION." >&2
  exit 1
fi

script_path="${BASH_SOURCE[0]:-}"
if [ -n "$script_path" ]; then
  here="${script_path%/*}"
  [ "$here" = "$script_path" ] && here="."
  if [ -f "$here/bin/install.js" ]; then
    exec node "$here/bin/install.js" "$@"
  fi
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "evenhub-app-ui: npx is required and normally ships with Node.js." >&2
  exit 1
fi

exec npx -y "github:$REPO" "$@"
