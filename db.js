const fs = require("fs");

const readFile = (path) => {
  try {
    if (fs.existsSync(path)) {
      const data = JSON.parse(fs.readFileSync(path));
      return data;
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
};

const writeToFile = (path, obj, append = false) => {
  if (append) {
    fs.writeFileSync(path, JSON.stringify(obj, null, 2));
    return;
  }
  const existingData = readFile(path);
  const updateData = [...existingData, obj];
  fs.writeFileSync(path, JSON.stringify(updateData, null, 2));
};

const writeUnique = (path, id, obj, append = false) => {
  if (append) {
    fs.writeFileSync(path, JSON.stringify(obj, null, 2));
    return;
  }
  const existingData = readFile(path);
  const updateData = { ...existingData, [id]: obj };
  fs.writeFileSync(path, JSON.stringify(updateData, null, 2));
};

module.exports.db = {
  write: writeToFile,
  writeUnique: writeUnique,
  read: readFile,
};
