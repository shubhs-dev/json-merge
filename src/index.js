#!/usr/bin/env node

const { promisify } = require("util");
const glob = require("glob");
const { join } = require("path");

const asyncGlob = promisify(glob);

const { asyncMap, asyncReadFile } = require("./utility");

async function parseFile(filePath) {
  const buffer = await asyncReadFile(filePath);
  const text = buffer.toString();
  try {
    return JSON.parse(text);
  } catch (parseError) {
    throw new Error(`Failed to parse ${filePath}. Error: ${parseError}`);
  }
}

async function processMatch(searchPath, filePath, result) {
  const fullPath = join(searchPath, filePath);
  const json = await parseFile(fullPath);
  return Object.assign(result, json);
}

async function merge(searchPath, options = {}) {
  const {
    include = "*.json",
    exclude,
    caseInsensitive = true,
    recursive = true,
  } = options;
  const matches = await asyncGlob(include, {
    cwd: searchPath,
    mark: true,
    ignore: exclude,
    matchBase: recursive,
    nodir: true,
    nocase: caseInsensitive,
  });

  const result = {};

  await asyncMap(matches, (filePath) =>
    processMatch(searchPath, filePath, result)
  );

  return result;
}

module.exports = { merge };
