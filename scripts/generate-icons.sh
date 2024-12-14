#!/bin/bash

# Generate PWA icons for Dihadi app
# This script fetches an SVG icon and converts it to various sizes

set -e

echo "🎨 Generating PWA icons..."

# Create public directory if it doesn't exist
mkdir -p public

# Fetch a nice calendar/habit icon from Lucide (open source icon library)
# Using the "calendar-check" icon which fits the habit tracker theme
# White icon on transparent background
# Only fetch if the source SVG doesn't exist (so it stays in git)
if [ ! -f "public/icon-source.svg" ]; then
    echo "📥 Fetching icon from Lucide..."
    curl -s "https://api.iconify.design/lucide:clipboard-check.svg?color=%23ffffff&width=512&height=512" -o public/icon-source.svg
else
    echo "✓ Using existing icon-source.svg from git"
fi

# Use node script with sharp to generate icons with black background and rounded corners
echo "🖼️  Converting SVG to PNG formats with sharp..."
node scripts/generate-icons.js

echo "✅ Icons generated successfully!"
echo "📁 Files created in public/ directory"
ls -lh public/*.png public/*.ico 2>/dev/null || true
