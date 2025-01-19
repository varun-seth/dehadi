// This script downloads SVGs for the user icon subset (bold variant) from Phosphor Icons and saves them locally.
// It reads icon names from src/lib/icons-metadata.json and downloads each SVG to public/phosphor-svg/

const fs = require('fs');
const path = require('path');
const https = require('https');

const metadataPath = path.join(__dirname, '../src/lib/icons-metadata.json');
const outputDir = path.join(__dirname, '../public/phosphor-svg');
const PHOSPHOR_REPO = 'https://raw.githubusercontent.com/phosphor-icons/core/master/assets/bold';

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const iconNames = metadata.userIcons.map(icon => icon.name);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}


function toKebabCase(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
}

function downloadSVG(iconName) {
  // Use slug if available, else convert name to kebab-case
  const iconMeta = metadata.userIcons.find(icon => icon.name === iconName);
  const base = iconMeta.slug ? iconMeta.slug : toKebabCase(iconName);
  const fileName = `${base}-bold.svg`;
  const url = `${PHOSPHOR_REPO}/${fileName}`;
  const dest = path.join(outputDir, fileName);
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
    }).on('error', reject);
  });
}

(async () => {
  console.log(`Downloading ${iconNames.length} SVGs to ${outputDir}`);
  for (const iconName of iconNames) {
    try {
      await downloadSVG(iconName);
      console.log(`Downloaded: ${iconName}`);
    } catch (err) {
      console.error(`Error downloading ${iconName}:`, err.message);
    }
  }
  console.log('SVG download complete.');
})();
