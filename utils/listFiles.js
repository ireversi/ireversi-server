const fs = require('fs');
const path = require('path');

const listFiles = (dirPath) => {
  const files = [];

  fs.readdirSync(dirPath).forEach((name) => {
    const target = path.join(dirPath, name);

    if (fs.statSync(target).isFile()) files.push(target);
    else files.push(...listFiles(target));
  });

  return files;
};

module.exports = listFiles;
