const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const svgBuffer = fs.readFileSync('public/icon-source.svg');
  
  // Function to create icon with black background and rounded corners
  async function createIcon(size, outputPath, cornerRadius) {
    // Create a black rounded rectangle background
    const background = Buffer.from(
      `<svg width="${size}" height="${size}">
        <rect width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#000000"/>
      </svg>`
    );
    
    // Calculate padding (20% of size for nice spacing)
    const padding = Math.round(size * 0.15);
    const iconSize = size - (padding * 2);
    
    // Resize the white icon
    const icon = await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .toBuffer();
    
    // Composite: background + icon centered with padding
    await sharp(background)
      .composite([{
        input: icon,
        top: padding,
        left: padding
      }])
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Created ${outputPath}`);
  }
  
  // Generate different sizes with appropriate corner radius
  await createIcon(192, 'public/pwa-192x192.png', 38);
  await createIcon(512, 'public/pwa-512x512.png', 102);
  await createIcon(192, 'public/pwa-maskable-192x192.png', 38);
  await createIcon(512, 'public/pwa-maskable-512x512.png', 102);
  await createIcon(180, 'public/apple-touch-icon.png', 36);
  
  // Favicon - smaller corner radius
  await createIcon(32, 'public/favicon.ico', 6);
}

generateIcons().catch(console.error);
