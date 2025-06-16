const fs = require('fs');
const { parseScroll } = require('./scroll_parser');

const schema = JSON.parse(fs.readFileSync('./guardian_schema.json', 'utf8'));
const config = JSON.parse(fs.readFileSync('./guardian_config.json', 'utf8'));
const recognizedGuardians = Object.keys(config.guardians || {});

function validate(meta) {
  const errors = [];
  for (const field of schema.required) {
    if (!meta[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  if (meta.expires) {
    const exp = new Date(meta.expires);
    if (isNaN(exp.getTime())) {
      errors.push('Invalid expires date');
    } else if (exp < new Date()) {
      errors.push('Scroll has expired');
    }
  }
  if (meta.guardian && !recognizedGuardians.includes(meta.guardian.toUpperCase())) {
    errors.push(`Unrecognized guardian: ${meta.guardian}`);
  }
  return errors;
}

function validateScroll(path) {
  const meta = parseScroll(path);
  const errors = validate(meta);
  if (errors.length) {
    console.log('Validation failed:', errors.join('; '));
    return false;
  }
  console.log('Scroll is valid.');
  return true;
}

if (require.main === module) {
  const file = process.argv[2] || 'test.scroll';
  validateScroll(file);
}

module.exports = { validateScroll };
