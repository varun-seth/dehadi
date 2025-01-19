#!/bin/bash
set -e

# Download bold CSS and font files from @phosphor-icons/web
PHOSPHOR_VERSION="2.1.2"
PHOSPHOR_BASE="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@${PHOSPHOR_VERSION}/src/bold"
PUBLIC_DIR="$(dirname "$0")/../public/phosphor-bold"

mkdir -p "$PUBLIC_DIR"

# Download CSS
curl -sSL "$PHOSPHOR_BASE/style.css" -o "$PUBLIC_DIR/style.css"

# Parse font filenames from CSS
cd "$PUBLIC_DIR"
FONT_URLS=$(grep -oE 'url\(([^)]*)\)' style.css | sed 's/url(\|)//g' | tr -d '\"')

# Download each font file
for FONT_URL in $FONT_URLS; do
  # Remove relative path if present
  FONT_FILE=$(basename "$FONT_URL")
  curl -sSL "$PHOSPHOR_BASE/$FONT_FILE" -o "$FONT_FILE"
done

cd - > /dev/null

echo "Phosphor bold CSS and fonts downloaded to $PUBLIC_DIR"
