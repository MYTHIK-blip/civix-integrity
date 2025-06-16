const fs = require('fs');

function parseWorkflow(path) {
  const data = fs.readFileSync(path, 'utf8');
  try {
    return JSON.parse(data);
  } catch (e) {
    throw new Error(`Invalid JSON in ${path}: ${e.message}`);
  }
}

if (require.main === module) {
  const path = process.argv[2] || 'sample_workflow.json';
  const workflow = parseWorkflow(path);
  console.log('Workflow loaded:', workflow);
}

module.exports = { parseWorkflow };
