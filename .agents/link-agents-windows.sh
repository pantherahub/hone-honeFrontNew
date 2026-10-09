#!/usr/bin/env bash
set -euo pipefail

# Pensado para correr en Git Bash en Windows.
# Usa junctions (no symlinks nativos): no requieren admin ni Modo de desarrollador.
# PowerShell evita el quoting hell de `cmd /c mklink` con rutas que tienen espacios.

# ── CONFIGURA ESTO ────────────────────────────────────────────────
# Este script vive DENTRO de .agents, así que .claude/.cursor/.codex/.ai
# se crean un nivel arriba (hermanos de .agents).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
AGENTS_DIR="$SCRIPT_DIR"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

FOLDER_1="rules"
FOLDER_2="skills"

TARGETS=(".claude" ".cursor" ".codex" ".ai")
# ────────────────────────────────────────────────────────────────

if [ ! -d "$AGENTS_DIR" ]; then
  echo "❌ No existe $AGENTS_DIR"
  exit 1
fi

# Crea una junction, o sale al toque si ya apunta al origen correcto.
# Las rutas van por env vars: PowerShell/$args parte los espacios del usuario.
ensure_junction() {
  local dest="$1"
  local src="$2"
  JUNCTION_DEST="$(cygpath -w "$dest")"
  JUNCTION_SRC="$(cygpath -w "$src")"
  export JUNCTION_DEST JUNCTION_SRC

  powershell.exe -NoProfile -NonInteractive -Command '& {
    $ErrorActionPreference = "Stop"
    $dest = $env:JUNCTION_DEST
    $src  = $env:JUNCTION_SRC
    if (Test-Path -LiteralPath $dest) {
      $item = Get-Item -LiteralPath $dest -Force
      $current = ""
      if ($item.LinkType) {
        $current = ([string]$item.Target).TrimEnd([char]92, [char]47)
      }
      $wanted = $src.TrimEnd([char]92, [char]47)
      if ($item.LinkType -eq "Junction" -and $current -ieq $wanted) {
        exit 0
      }
      if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
        [IO.Directory]::Delete($dest)
      } else {
        Remove-Item -LiteralPath $dest -Recurse -Force
      }
    }
    New-Item -ItemType Junction -Path $dest -Value $src | Out-Null
  }' < /dev/null
}

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

    ensure_junction "$dest" "$src"
    echo "✔ $dest -> $src (junction)"
  done
done

# launch.json es solo de Claude Code y debe vivir en .claude/launch.json.
# Los archivos no admiten junctions; se usa un hard link (no pide admin y la ruta es el mismo volumen).
# Ojo: si un editor reemplaza el archivo en vez de editarlo en sitio, el enlace se rompe: vuelve a correr el script.
LAUNCH_SRC="$AGENTS_DIR/claude/launch.json"
LAUNCH_DEST="$BASE_DIR/.claude/launch.json"

if [ -f "$LAUNCH_SRC" ]; then
  if [ ! "$LAUNCH_DEST" -ef "$LAUNCH_SRC" ]; then
    rm -f "$LAUNCH_DEST"
    ln "$LAUNCH_SRC" "$LAUNCH_DEST"
  fi
  echo "✔ $LAUNCH_DEST -> $LAUNCH_SRC (hard link)"
else
  echo "⚠️  No existe $LAUNCH_SRC, se omite."
fi

echo "Listo."

# Alternativa si de verdad quieres symlinks nativos en vez de junctions:
#   1) Activa "Modo de desarrollador" en Windows, o corre Git Bash como Admin
#   2) export MSYS=winsymlinks:nativestrict
#   3) Reemplaza ensure_junction por: ln -sfn "$src" "$dest"
