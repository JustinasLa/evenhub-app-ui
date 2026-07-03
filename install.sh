#!/usr/bin/env bash
set -euo pipefail

REPO="JustinasLa/evenhub-app-ui"

if ! command -v node >/dev/null 2>&1; then
  echo "evenhub-app-ui: Node.js 18 or newer is required." >&2
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "evenhub-app-ui: Node.js 18 or newer is required; found $NODE_MAJOR." >&2
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
