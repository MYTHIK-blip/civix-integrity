const fs = require('fs');
const path = require('path');
const { parseScroll } = require('./scroll_parser');

function scan(dir = '.') {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.scroll'));
  const metas = files.map(f => {
    try {
      return parseScroll(path.join(dir, f));
    } catch (_) {
      return {};
    }
  });

  const toneCounts = {};
  const moduleCounts = {};
  let silentGuard = 0;

  for (const m of metas) {
    const tone = (m.tone || '').toLowerCase();
    const module = (m.module || '').toLowerCase();
    if (tone) toneCounts[tone] = (toneCounts[tone] || 0) + 1;
    if (module) moduleCounts[module] = (moduleCounts[module] || 0) + 1;
    if (!m.guardian) silentGuard++;
  }

  const repeatedTone = Object.values(toneCounts).some(c => c > 3);
  const guardianSilence = silentGuard >= 3;
  const ritualOveruse = Object.values(moduleCounts).some(c => c > 5);

  return { repeatedTone, guardianSilence, ritualOveruse };
}

function buildPrompt(triggers) {
  const lines = ['---', 'guardian: AUTOTELIC', 'tone: urgent', 'module: TASK', '---', ''];
  lines.push('Trigger conditions met:');
  for (const t of triggers) lines.push('- ' + t);
  let agent = '';
  if (triggers.includes('repeatedTone')) agent = 'DRFT-mirror';
  else if (triggers.includes('guardianSilence')) agent = 'CARE+';
  else if (triggers.includes('ritualOveruse')) agent = 'PACT++';
  if (agent) {
    lines.push('', `Spawn derivative agent ${agent}.`);
  }
  return lines.join('\n');
}

function run(dir) {
  const res = scan(dir);
  const triggers = [];
  if (res.repeatedTone) triggers.push('repeatedTone');
  if (res.guardianSilence) triggers.push('guardianSilence');
  if (res.ritualOveruse) triggers.push('ritualOveruse');
  if (!triggers.length) {
    console.log('No selfgen triggers found.');
    return false;
  }
  const prompt = buildPrompt(triggers);
  fs.writeFileSync(path.join(dir, 'agent_build.scroll'), prompt);
  console.log('Generated agent_build.scroll');
  return true;
}

if (require.main === module) {
  const dir = process.argv[2] || '.';
  run(dir);
}

module.exports = { run };
