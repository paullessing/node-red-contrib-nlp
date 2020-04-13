#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const recurse = (basedir, dir, callback) => {
  const contents = fs.readdirSync(path.join(basedir, dir))
    .filter(x => x && !x.match(/^\./));
  contents.forEach((file) => {
    const absolutePath = path.join(basedir, dir, file);
    const relativePath = path.join(dir, file);
    const stat = fs.statSync(absolutePath);
    if (stat.isFile()) {
      callback({
        name: file,
        absolutePath,
        relativePath,
        absoluteDir: path.join(basedir, dir),
        relativeDir: dir,
      });
    } else if (stat.isDirectory()) {
      recurse(basedir, relativePath, callback);
    }
  });
}

const getAllFiles = (dir) => {
  const files = [];
  recurse(dir, '', (file) => {
    files.push(file);
  });
  return files;
}

const src = path.join(__dirname, '..', 'src');
const dist = path.join(__dirname, '..', 'dist');
const temp = path.join(__dirname, '..', 'temp');

const sourceFiles = getAllFiles(src);
const tempFiles = getAllFiles(temp);

const htmlFiles = sourceFiles.filter(({ name }) => name.match(/\.html$/i));

htmlFiles.forEach(replaceFile);

function replaceFile(file) {
  const content = readFile(file.absolutePath);

  const replacements = getReplacements(content).map((replacement) => ({
    ...replacement,
    content: findReplacementFile(file.relativeDir, replacement.name),
  }));

  let lastIndex = 0;
  const newFile = [];
  for (const { start, end, content: replacementContent } of replacements) {
    newFile.push(content.slice(lastIndex, start));
    newFile.push(replacementContent);
    lastIndex = end;
  }
  newFile.push(content.slice(lastIndex));

  const newContent = newFile.join('');

  fs.mkdirSync(path.join(dist, file.relativeDir), { recursive: true });
  fs.writeFileSync(path.join(dist, file.relativePath), newContent);

  // console.log(newContent);
}

function getReplacements(content) {
  const r = /\/\* replace:(.*?) \*\//gi;

  const replacements = []
  let match;
  while ((match = r.exec(content)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === r.lastIndex) {
      r.lastIndex++;
    }

    replacements.push({
      start: match.index,
      end: match.index + match[0].length,
      name: match[1],
    });
  }

  return replacements;
}

function findReplacementFile(relativeDir, fileName) {
  const file = readFile(path.join(src, relativeDir, fileName)) ||
    readFile(path.join(temp, relativeDir, fileName));

  if (!file) {
    throw new Error('File not found: ' + path.join(relativeDir, fileName));
  }

  return file;
}

function readFile(file) {
  try {
    return fs.readFileSync(file).toString();
  } catch (e) {
    return null;
  }
}
