#!/usr/bin/env bash
# Setup Python 3.10+ venv for MCP server when system only has older Python.
# Use this if: sudo apt install python3.11 fails (no PPA or non-Ubuntu).

set -e
cd "$(dirname "$0")/.."
PROJECT_ROOT="$PWD"
VENV_DIR="$PROJECT_ROOT/.venv"

# 1) Try to find Python 3.10+
for py in python3.12 python3.11 python3.10; do
  if command -v "$py" &>/dev/null; then
    PYTHON=$(command -v "$py")
    echo "Using: $PYTHON"
    break
  fi
done

if [ -z "$PYTHON" ]; then
  echo "No Python 3.10+ found. Install one of:"
  echo "  Ubuntu: sudo add-apt-repository ppa:deadsnakes/ppa && sudo apt update && sudo apt install python3.11 python3.11-venv"
  echo "  Or install pyenv and run: pyenv install 3.11.6 && pyenv local 3.11.6"
  exit 1
fi

# 2) Remove old venv if any
rm -rf "$VENV_DIR"

# 3) Create venv and install deps
"$PYTHON" -m venv "$VENV_DIR"
"$VENV_DIR/bin/pip" install --upgrade pip
"$VENV_DIR/bin/pip" install mcp pyyaml

echo "Done. Activate with: source $VENV_DIR/bin/activate"
echo "Test MCP server: $VENV_DIR/bin/python3 $PROJECT_ROOT/mcp_server.py"
