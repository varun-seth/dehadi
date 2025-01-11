// This script reads icons-metadata.json and generates src/lib/iconsSubset.jsx
const fs = require('fs');
const path = require('path');

const metadataPath = path.join(__dirname, '../src/lib/icons-metadata.json');
const outputPath = path.join(__dirname, '../src/lib/iconsSubset.jsx');

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const iconNames = metadata.icons.map(icon => icon.name);

const importLines = iconNames.map(name => `import { ${name} } from '@phosphor-icons/react';`).join('\n');
const exportLines = [
  'export const Icons = {',
  ...iconNames.map(name => `  ${JSON.stringify(name)}: ${name},`),
  '};',
  '',
  'export default Icons;',
];

const fileContent = [
  '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
  importLines,
  '',
  ...exportLines,
  '',
].join('\n');

fs.writeFileSync(outputPath, fileContent);
console.log('iconsSubset.jsx generated with', iconNames.length, 'icons.');
