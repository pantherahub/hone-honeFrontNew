#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi
set -euo pipefail

# ── CONFIGURA ESTO ────────────────────────────────────────────────
# Este script vive DENTRO de .agents, así que .claude/.cursor/.codex/.ai
# se crean un nivel arriba (hermanos de .agents).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
AGENTS_DIR="$SCRIPT_DIR"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

# Nombres de las 2 carpetas dentro de .agents que quieres enlazar
FOLDER_1="rules"
FOLDER_2="skills"

# Destinos donde se crearán los symlinks
TARGETS=(".claude" ".cursor" ".codex" ".ai")
# ────────────────────────────────────────────────────────────────

if [ ! -d "$AGENTS_DIR" ]; then
  echo "❌ No existe $AGENTS_DIR"
  exit 1
fi

echo "Enlazando ${FOLDER_1} y ${FOLDER_2}..."

for target in "${TARGETS[@]}"; do
  target_dir="$BASE_DIR/$target"
  mkdir -p "$target_dir"

  for folder in "$FOLDER_1" "$FOLDER_2"; do
    src="$AGENTS_DIR/$folder"
    dest="$target_dir/$folder"

    if [ ! -d "$src" ]; then
      echo "⚠️  No existe $src, se omite."
      continue
    fi

    # ln -sfn no reemplaza una carpeta real: crea el enlace adentro.
    if [ -e "$dest" ] && [ ! -L "$dest" ]; then
      rm -rf "$dest"
    fi

    # -f sobreescribe si ya existe, -n no sigue symlinks previos
    ln -sfn "$src" "$dest"
    echo "✔ $dest -> $src"
  done
done

echo "Listo."
