#!/usr/bin/env node
/* eslint-disable no-console */

const { isAbsolute, resolve, dirname } = require("path");
const yargs = require("yargs");
const { merge } = require("./index");
const {
  asyncMap,
  asyncRemoveFile,
  asyncWriteJson,
  asyncReadFile,
  existsSync,
  asyncMkdir,
} = require("./utility");

const { argv } = yargs
  .usage("Usage: $0 <command> [options]")
  .command("merge", "Merge JSON files in the specified path")
  .example(
    "$0 merge -i src -o en-resources.json",
    "Merge JSON files in src and sub-directories"
  )
  .alias("i", "input")
  .array("i")
  .nargs("i", 1)
  .describe("i", "input path to search for JSON")
  .alias("o", "output")
  .nargs("o", 1)
  .describe("o", "Output File Path")
  .alias("m", "match")
  .nargs("m", 1)
  .describe("m", "match files using regex")
  .boolean("r")
  .alias("r", "replace")
  .describe("r", "Replace the output file content")
  .alias("e", "exclude")
  .nargs("e", 1)
  .describe("e", "Exclude path using regex")
  .boolean("c")
  .alias("c", "case-sensitive")
  .describe("c", "Do a case sensitive match")
  .boolean("R")
  .alias("R", "recursive")
  .describe(
    "R",
    "Search child directories as well, works only if include doesn't contain /"
  )
  .boolean("f")
  .alias("f", "create-directory")
  .describe("f", "Force create output directory if not present already")
  .demandOption(["i", "o"])
  .help("h")
  .alias("h", "help")
  .alias("v", "version")
  .check((args) => {
    const { match } = args;

    if (Array.isArray(match)) {
      throw new Error("Only 1 match value should be provided");
    }

    return true;
  });

function errorHandler(error) {
  process.exitCode = process.exitCode || 1;
  console.log(error);
  if (error.stack) {
    console.log(error.stack);
  }
}

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection");
  errorHandler(error);
});

function runAsyncMain(mainFn, ...args) {
  const promise = new Promise((resolveFn) => resolveFn(mainFn(...args)));
  promise.catch(errorHandler);
}

async function main() {
  let result = {};

  // if no-replace, then save output file content
  if (!argv.r) {
    try {
      Object.assign(result, JSON.parse(await asyncReadFile(argv.o)));
    } catch {
      result = {};
    }
  }

  // delete output file to prevent including it in merge
  await asyncRemoveFile(argv.o);

  await asyncMap(argv.i, async (dirName) => {
    const configPath = isAbsolute(dirName)
      ? dirName
      : resolve(process.cwd(), dirName);

    const json = await merge(configPath, {
      include: argv.m || undefined,
      exclude: argv.e,
      caseInsensitive: !argv.c,
      recursive: argv.R,
    });
    Object.assign(result, json);
  });

  if (argv.f && !existsSync(dirname(argv.o))) {
    await asyncMkdir(dirname(argv.o), { recursive: true });
  }

  await asyncWriteJson(argv.o, result);
}

runAsyncMain(main);
