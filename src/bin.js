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

await execa("node", ["--import", register, ...nodeArgs], {
  stdio: "inherit",
  serialization: "advanced",
  reject: false,
});
