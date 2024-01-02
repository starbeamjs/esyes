#!/usr/bin/env node

import { resolve } from "node:path";

import { execa } from "execa";

const __dirname = new URL(".", import.meta.url).pathname;

const register = resolve(__dirname, "register.js");
const nodeArgs = process.argv.slice(2);

if (nodeArgs.length === 0) {
  // eslint-disable-next-line no-console
  console.error(`Usage: esyes <file> [node-args...]`);
  process.exit(1);
}

/**
 * @param {unknown} e
 * @returns {e is { exitCode: number; command: string; }}
 */
function isExecaError(e) {
  if (typeof e !== "object") return false;
  if (e === null) return false;

  return "exitCode" in e && "command" in e;
}

try {
  await execa("node", ["--import", register, ...nodeArgs], {
    stdio: "inherit",
    serialization: "advanced",
    reject: true,
  });
} catch (e) {
  if (isExecaError(e)) {
    // Error will have already logged.
    // No need to include the trace from execa and esyes
    process.exit(e.exitCode);
  }

  throw e;
}
