const fs = require('fs');
const { parseScroll, parseMetadata } = require('./scroll_parser');

function parseWithContent(file) {
  const data = fs.readFileSync(file, 'utf8');
  const meta = parseMetadata(data);
  const match = data.match(/^---\s*\n[\s\S]*?\n---\n([\s\S]*)/);
  if (match) {
    meta.content = meta.content || match[1].trim();
  }
  return meta;
}

function loadRegistry(path = './trace_registry.json') {
  if (!fs.existsSync(path)) return [];
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`Failed to read ${path}:`, err.message);
    return [];
  }
}

function classify(meta, history) {
  if (!history.length) return 'unknown';
  const last = history[history.length - 1];
  if (last.tone !== meta.tone) return 'mutation';
  return 'echo';
}

function trace(file) {
  // use existing parser for logging and routing
  parseScroll(file);
  const meta = parseWithContent(file);
  const registry = loadRegistry();
  const ancestry = registry.filter(r => r.content === meta.content);
  const drift = ancestry.map(a => a.tone);
  let anomaly = classify(meta, ancestry);
  if (!meta.guardian) {
    anomaly = 'mutation';
  } else if (ancestry.length && ancestry[ancestry.length - 1].tone !== meta.tone) {
    drift.push(meta.tone);
  }
  const result = { ancestry: ancestry.map(a => a.id || a.content), drift, anomaly };
  fs.writeFileSync('trace_output.json', JSON.stringify(result, null, 2));
  console.log('Trace output saved to trace_output.json');
  return result;
}

if (require.main === module) {
  const file = process.argv[2] || 'test.scroll';
  trace(file);
}

module.exports = { trace };
