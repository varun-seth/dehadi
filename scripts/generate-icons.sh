#!/bin/bash

# Generate PWA icons for Dihadi app
# This script fetches an SVG icon and converts it to various sizes

set -e

echo "🎨 Generating PWA icons..."

# Create public directory if it doesn't exist
mkdir -p public

# Fetch a nice calendar/habit icon from Lucide (open source icon library)
# Using the "calendar-check" icon which fits the habit tracker theme
# Only fetch if the source SVG doesn't exist (so it stays in git)
if [ ! -f "public/icon-source.svg" ]; then
    echo "📥 Fetching icon from Lucide..."
    curl -s "https://api.iconify.design/lucide:calendar-check.svg?color=%23000000&width=512&height=512" -o public/icon-source.svg
else
    echo "✓ Using existing icon-source.svg from git"
fi

# Install sharp-cli if not already installed
if ! command -v sharp &> /dev/null; then
    echo "📦 Installing sharp-cli..."
    npm install -g sharp-cli
fi

echo "🖼️  Converting SVG to PNG formats..."

# Generate different sizes
sharp -i public/icon-source.svg -o public/pwa-192x192.png resize 192 192
sharp -i public/icon-source.svg -o public/pwa-512x512.png resize 512 512
sharp -i public/icon-source.svg -o public/pwa-maskable-192x192.png resize 192 192
sharp -i public/icon-source.svg -o public/pwa-maskable-512x512.png resize 512 512
sharp -i public/icon-source.svg -o public/apple-touch-icon.png resize 180 180
sharp -i public/icon-source.svg -o public/favicon.ico resize 32 32

echo "✅ Icons generated successfully!"
echo "📁 Files created in public/ directory"
ls -lh public/*.png public/*.ico 2>/dev/null || true
