module.exports = {
  inputDir: 'public/phosphor-svg', // SVG source directory
  outputDir: 'public/phosphor-font', // Output directory for font files and CSS
  fontTypes: ['woff2', 'woff', 'ttf'],
  assetTypes: ['css', 'json'],
  name: 'phosphor-custom',
  prefix: 'ph',
  fontsUrl: '/phosphor-font/', // Public URL for font files
  normalize: true,
  selector: '.ph',
  formatOptions: {
    json: {
      indent: 2
    }
  },
  templates: {},
};
