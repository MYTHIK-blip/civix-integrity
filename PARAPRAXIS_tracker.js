const fs = require('fs');
const { parseMetadata } = require('./scroll_parser');

function parseScrollWithContent(path) {
  const data = fs.readFileSync(path, 'utf8');
  const meta = parseMetadata(data);
  const match = data.match(/^---\s*\n[\s\S]*?\n---\n([\s\S]*)/);
  meta.content = match ? match[1].trim() : '';
  return meta;
}

const toneKeywords = {
  gentle: ['gentle', 'calm', 'peace', 'soothing', 'quiet'],
  urgent: ['urgent', 'immediately', 'asap', 'emergency', 'now'],
  grief: ['grief', 'mourn', 'loss', 'sad', 'cry'],
  adversarial: ['fight', 'battle', 'attack', 'enemy', 'confront'],
  ceremonial: ['ceremony', 'procession', 'formal', 'ritualistic'],
  sacred: ['sacred', 'holy', 'ritual', 'blessed']
};

function detectTone(text) {
  const lower = text.toLowerCase();
  let bestTone = '';
  let bestCount = 0;
  for (const [tone, words] of Object.entries(toneKeywords)) {
    let count = 0;
    for (const w of words) {
      const regex = new RegExp(`\\b${w}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) count += matches.length;
    }
    if (count > bestCount) {
      bestCount = count;
      bestTone = tone;
    }
  }
  return { tone: bestTone, count: bestCount };
}

function analyze(file) {
  const meta = parseScrollWithContent(file);
  const declared = (meta.tone || '').toLowerCase();
  const detection = detectTone(meta.content || '');
  let severity = 0;
  if (declared && detection.tone && declared !== detection.tone) {
    severity = detection.count > 2 ? 2 : 1;
  }
  const log = {
    file,
    declaredTone: declared || null,
    detectedTone: detection.tone || null,
    severity
  };
  fs.writeFileSync('parapraxis_log.json', JSON.stringify(log, null, 2));
  console.log('Parapraxis log saved to parapraxis_log.json');
  return log;
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node PARAPRAXIS_tracker.js <scroll>');
    process.exit(1);
  }
  analyze(file);
}

module.exports = { analyze };
