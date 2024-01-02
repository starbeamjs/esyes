import path from "node:path";
import url from "node:url";
import fs from "node:fs/promises";

import { execa } from "execa";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const exitCodesDir = path.join(__dirname, "exit-code");

const bin = path.join(__dirname, "../src/bin.js");

async function listDirectories(pth) {
  const directories = (await fs.readdir(pth, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dir) => dir.name);

  return directories;
}

async function listFiles(pth) {
  const directories = (await fs.readdir(pth, { withFileTypes: true }))
    .filter((dirent) => !dirent.isDirectory())
    .map((dir) => dir.name);

  return directories;
}

const exitCodes = await listDirectories(exitCodesDir);

const tests = [];
const results = [];

for (let exitCodeStr of exitCodes) {
  let exitCode = parseInt(exitCodeStr, 10);

  let exitCodeDir = path.join(exitCodesDir, exitCodeStr);
  let testFiles = await listFiles(exitCodeDir);

  for (let test of testFiles) {
    let testPath = path.join(exitCodeDir, test);

    tests.push({ testPath, exitCode });
  }
}

console.info(`Found ${tests.length} tests`);

for (let { testPath, exitCode } of tests) {
  try {
    let result = await execa(bin, testPath);

    results.push({
      name: testPath,
      exitCode: {
        actual: result.exitCode,
        expected: exitCode,
      },
      pass: result.exitCode === exitCode,
    });
  } catch (e) {
    results.push({
      name: testPath,
      exitCode: {
        actual: e.exitCode,
        expected: exitCode,
      },
      pass: e.exitCode === exitCode,
    });
  }
}

for (let result of results) {
  let { pass, name, exitCode } = result;
  let symbol = pass ? `` : ``;
  let failureMsg = pass
    ? ``
    : `\n\tExpected: ${exitCode.expected}\n\tReceived: ${exitCode.actual}`;

  let shorterName = name.replace(__dirname, "");

  console.info(`${symbol} ${shorterName}${failureMsg}`);
}

let hasFailure = results.some((result) => !result.pass);

if (hasFailure) {
  console.error("Some test(s) failed");
  process.exit(1);
}
