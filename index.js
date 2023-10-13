import { createRequire } from "node:module";

import { execaSync } from "execa";

const __dirname = new URL(".", import.meta.url).pathname;

const loader = createRequire(__dirname).resolve("@esbuild-kit/esm-loader");
const nodeArgs = process.argv.slice(2);

if (nodeArgs.length === 0) {
  // eslint-disable-next-line no-console
  console.error(`Usage: ${process.argv[0]} <file> [node-args...]`);
  process.exit(1);
}

execaSync("node", ["--loader", loader, ...nodeArgs], {
  env: { NODE_NO_WARNINGS: "1" },
  stdio: "inherit",
});
