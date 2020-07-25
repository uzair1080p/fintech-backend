const fs = require('fs');
const path = require('path');

const usedRoutes = [];
const requestsAndResponses = {};
exports.saveRequest = (method, file, route, data) => {
  const key = `REQ ${method} ${route}`;
  if (usedRoutes.indexOf(key) !== -1) {
    return;
  }
  usedRoutes.push(key);
  const str = data ? JSON.stringify(data, null, 4) : '';
  const request = '`\n\nRequest:\n```\n' + str + '\n```\n\n';
  const result = '## ' + method.toUpperCase() + ' `' + route + (str ? request : '`\n\n');
  if (!requestsAndResponses[file]) {
    requestsAndResponses[file] = [];
  }
  requestsAndResponses[file].push(result);
};

exports.saveResponse = (method, file, route, data) => {
  const key = `RES ${method} ${route}`;
  if (usedRoutes.indexOf(key) !== -1) {
    return;
  }
  usedRoutes.push(key);
  const str = data ? JSON.stringify(data, null, 4) : '';
  const result = 'Response:\n```\n' + str + '\n```\n\n\n';
  if (!requestsAndResponses[file]) {
    requestsAndResponses[file] = [];
  }
  requestsAndResponses[file].push(result);
};

const usedErrors = [];
const errors = [];
exports.saveError = (data) => {
  if (usedErrors.indexOf(data.name) !== -1) {
    return;
  }
  usedErrors.push(data.name);
  const str = data ? JSON.stringify(data, null, 4) : '';
  const result = `#### APIError: ${data.name}\n` + '```\n' + str + '\n```\n\n\n';
  errors.push(result);
};

exports.writeDocumentation = () => {
  if (!(process.argv.length === 5 && process.argv[4] === 'docs')) {
    return;
  }
  const errorsPath = path.join(__dirname, '..', 'docs', 'errors.md');
  const readmePath = path.join(__dirname, '..', 'readme.md');
  const readme = ['# Documentation\n\n'];
  for (let r in requestsAndResponses) {
    const data = requestsAndResponses[r];
    const filePath = path.join(__dirname, '..', 'docs', `${r}.md`);
    const relPath = path.relative(path.join(__dirname, '..'), filePath);
    fs.writeFileSync(filePath, data.join(''));
    readme.push(`[${uppercase(r)} API Documentation](${relPath})\n\n`);
  }
  const relPath = path.relative(path.join(__dirname, '..'), path.join(__dirname, '..', 'docs', `errors.md`));
  readme.push(`[Errors API Documentation](${relPath})\n\n`);
  fs.writeFileSync(errorsPath, errors.join(''));
  fs.writeFileSync(readmePath, readme.join(''));
  console.log('Generated documentation files');
};

const uppercase = (str) => str.charAt(0).toUpperCase() + str.slice(1);