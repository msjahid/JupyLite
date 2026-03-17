#!/bin/bash
# Run ONCE to set up JupyLite file associations and icons
# Usage: bash install-icon-dev.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_ICON="$SCRIPT_DIR/assets/JupyLite.png"
IPYNB_ICON="$SCRIPT_DIR/assets/jupyter-logo.png"
APP_EXEC="$SCRIPT_DIR/node_modules/.bin/electron $SCRIPT_DIR . --no-sandbox"

# Fallback: if jupyter-logo.png not found, use JupyLite.png
if [ ! -f "$IPYNB_ICON" ]; then
  IPYNB_ICON="$APP_ICON"
  echo "⚠ jupyter-logo.png not found, using JupyLite.png for file icons"
fi

echo "=== JupyLite Setup ==="

# ── 1. App icons (all sizes) ──────────────────────────────────
for SIZE in 16 32 48 64 128 256 512; do
  DIR="$HOME/.local/share/icons/hicolor/${SIZE}x${SIZE}/apps"
  mkdir -p "$DIR"
  if command -v convert &>/dev/null; then
    convert "$APP_ICON" -resize "${SIZE}x${SIZE}" "$DIR/jupylite.png" 2>/dev/null
  else
    cp "$APP_ICON" "$DIR/jupylite.png"
  fi
done
echo "✓ App icons installed"

# ── 2. .ipynb file icons (jupyter-logo.png) ───────────────────
for SIZE in 48 64 128 256; do
  DIR="$HOME/.local/share/icons/hicolor/${SIZE}x${SIZE}/mimetypes"
  mkdir -p "$DIR"
  if command -v convert &>/dev/null; then
    convert "$IPYNB_ICON" -resize "${SIZE}x${SIZE}" "$DIR/application-x-ipynb+json.png" 2>/dev/null
  else
    cp "$IPYNB_ICON" "$DIR/application-x-ipynb+json.png"
  fi
done
echo "✓ .ipynb file icons installed (jupyter-logo)"

# ── 3. Register MIME type ─────────────────────────────────────
mkdir -p "$HOME/.local/share/mime/packages"
cat > "$HOME/.local/share/mime/packages/jupylite-ipynb.xml" << MIMEEOF
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="application/x-ipynb+json">
    <comment>Jupyter Notebook</comment>
    <icon name="application-x-ipynb+json"/>
    <glob pattern="*.ipynb"/>
    <glob pattern="*.IPYNB"/>
  </mime-type>
</mime-info>
MIMEEOF
echo "✓ MIME type registered"

# ── 4. Desktop entry ──────────────────────────────────────────
mkdir -p "$HOME/.local/share/applications"
cat > "$HOME/.local/share/applications/jupylite.desktop" << DESKEOF
[Desktop Entry]
Name=JupyLite
Comment=A beautiful Jupyter Notebook viewer
Exec=$APP_EXEC %f
Icon=jupylite
Type=Application
Categories=Development;Science;Education;
MimeType=application/x-ipynb+json;
StartupWMClass=jupylite
Keywords=jupyter;notebook;ipynb;python;
DESKEOF
echo "✓ Desktop entry created"

# ── 5. Update databases ───────────────────────────────────────
update-mime-database "$HOME/.local/share/mime" 2>/dev/null     && echo "✓ MIME database updated"
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null && echo "✓ Desktop database updated"
gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null && echo "✓ Icon cache updated"

# ── 6. Set as default ─────────────────────────────────────────
xdg-mime default jupylite.desktop application/x-ipynb+json 2>/dev/null && echo "✓ JupyLite set as default for .ipynb"

echo ""
echo "=== Done! ==="
echo "Restart your file manager or log out/in to see the new icons."
