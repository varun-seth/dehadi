// This script reads SVGs from public/phosphor-svg/ and generates src/lib/iconsSubset.jsx
// Each SVG is converted to a React component and exported in a map for dynamic usage

const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '../public/phosphor-svg');
const outputPath = path.join(__dirname, '../src/lib/iconsSubset.jsx');

function toPascalCase(str) {
  return str
    .replace(/(^\w|[-_]\w)/g, m => m.replace(/[-_]/, '').toUpperCase());
}

const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
const components = [];
const exportMap = [];

for (const file of files) {
  const svgContent = fs.readFileSync(path.join(svgDir, file), 'utf8');
  // Remove XML declaration if present
  const cleaned = svgContent.replace(/<\?xml[^>]*>/, '').trim();
  // Get base name (e.g. check-circle-bold.svg -> CheckCircle)
  const base = file.replace(/-bold\.svg$/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const componentName = toPascalCase(base);
  components.push(`export function ${componentName}(props) { return (${cleaned.replace('<svg', '<svg {...props}')} ); }`);
  exportMap.push(`  ${JSON.stringify(componentName)}: ${componentName},`);
}

const fileContent = [
  '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
  "import React from 'react';",
  '',
  ...components,
  '',
  'export const Icons = {',
  ...exportMap,
  '};',
  '',
  'export default Icons;',
  '',
].join('\n');

fs.writeFileSync(outputPath, fileContent);
console.log('React icon components generated:', files.length);
