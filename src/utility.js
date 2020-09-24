#!/usr/bin/env node

const { readFile, writeFile, unlink } = require("fs");
const { promisify } = require("util");

const asyncMap = (arr, callback) =>
  Promise.all(arr.map((...args) => callback(...args)));

const removeFile = promisify(unlink);
const asyncWriteFile = promisify(writeFile);
const asyncReadFile = promisify(readFile);

async function asyncWriteJson(filePath, content) {
  await asyncWriteFile(filePath, JSON.stringify(content));
}

async function asyncRemoveFile(filePath) {
  try {
    await removeFile(filePath);
  } catch {
    // do nothing
  }
}

module.exports = { asyncMap, asyncReadFile, asyncWriteJson, asyncRemoveFile };
