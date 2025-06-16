const fs = require('fs');
const path = require('path');

function parseMetadata(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  const meta = {};
  if (!match) return meta;
  const lines = match[1].split(/\n/);
  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts.shift().trim();
      const value = parts.join(':').trim();
      meta[key.toLowerCase()] = value;
    }
  }
  return meta;
}

function routeScroll(moduleName) {
  if (!moduleName) return null;
  const moduleFile = `./${moduleName.toUpperCase()}.js`;
  console.log(`Routing to module: CIVIX::${moduleName.toUpperCase()} (${moduleFile})`);
  return moduleFile;
}

function parseScroll(filePath) {
  const ext = path.extname(filePath);
  if (!['.scroll', '.md', '.ritual'].includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const meta = parseMetadata(content);
  console.log('Metadata:', meta);
  routeScroll(meta.module);
  return meta;
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scroll_parser.js <file.scroll|file.md|file.ritual>');
    process.exit(1);
  }
  parseScroll(file);
}

module.exports = { parseScroll, parseMetadata, routeScroll };
