const fs = require('fs');

function analyze(metadataList, options = {}) {
  const threshold = options.threshold || 0.5; // fraction of scrolls
  const toneCounts = {};
  for (const meta of metadataList) {
    const tone = (meta.tone || '').toLowerCase();
    if (!tone) continue;
    toneCounts[tone] = (toneCounts[tone] || 0) + 1;
  }
  const total = metadataList.length;
  const warnings = [];
  for (const [tone, count] of Object.entries(toneCounts)) {
    const ratio = count / total;
    if (ratio >= threshold && ['grief', 'urgent'].includes(tone)) {
      warnings.push(`Tone "${tone}" present in ${(ratio*100).toFixed(0)}% of recent scrolls.`);
    }
  }
  return warnings;
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node driftWatcher.js <metadata.json>');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const warnings = analyze(data);
  if (warnings.length) {
    console.warn('Tone drift detected:');
    for (const w of warnings) console.warn('-', w);
  } else {
    console.log('No significant tone drift detected.');
  }
}

module.exports = { analyze };
