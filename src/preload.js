/// <reference path="./modules.d.ts" />

import { createRequire } from "node:module";

import { SourceMapConsumer, SourceMapGenerator } from "source-map";
import * as tsx from "tsx/esm";

import { log, SourceBuffer } from "./buffer.js";

const require = createRequire(new URL(import.meta.url));

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
const { fromComment, fromObject } =
  /** @type {import("convert-source-map")} */ (require("convert-source-map"));

export const resolve = tsx.resolve;

const mode = process.env["MODE"] ?? "development";
const DEV = mode === "development";
const PROD = mode === "production";
const TRACE = process.env["TRACE"] ?? false;

const env = {
  MODE: mode,
  DEV: DEV ? true : false,
  PROD: PROD ? true : false,
  TRACE: TRACE ? true : false,
};

/**
 * @type {import("node:module").LoadHook}
 */
export const load = async (specifier, context, nextLoad) => {
  // Only process modules.
  if (context.format !== "module") return nextLoad(specifier, context);

  // Try to use the tsx loader to transform the module.
  const upstream = await tsx.load(specifier, context, nextLoad);

  // If the tsx loader didn't transform the module, then just continue.
  if (!upstream) return nextLoad(specifier, context);

  log("load", specifier);

  const source = String(upstream.source);

  // do a fast check for import.meta.env before doing any other work
  if (source.indexOf("import.meta.env") === -1) return upstream;

  const buffer = new SourceBuffer(source);

  /**
   * @type {import("./buffer.js").CodeMatch | null}
   */
  let next;

  while ((next = buffer.getNext("import.meta.env"))) {
    if (next === null) break;

    const dot = buffer.lookahead(".");

    if (dot) {
      const key = buffer.lookahead(/^(MODE|DEV|PROD|TRACE)/);

      // If there was `import.meta.env` but not
      // `.DEV|.PROD|.MODE|.TRACE`, leave it alone
      // and just keep scanning.
      if (!key) continue;

      const replacement =
        env[/** @type {"MODE" | "DEV" | "PROD" | "TRACE"} */ (key.string)];

      buffer.replace(
        { before: next.before, after: key.after },
        JSON.stringify(replacement),
      );
    } else {
      buffer.replace(next, `(${JSON.stringify(env)})`);
    }
  }

  /*
   * Source maps don't work correctly right now, but we should make it work.
   */
  const { code, map } = buffer.done({ hires: true, includeContent: true });

  const magicConsumer = await new SourceMapConsumer(map);
  const originalConsumer = await InlineConsumer(source);
  const comment = originalConsumer
    ? "\n" + buildSourceMapComment(magicConsumer, originalConsumer, specifier)
    : "";

  return {
    format: upstream.format,
    shortCircuit: true,
    source: code + comment,
  };
};

/**
 * @param {SourceMapConsumer} magic
 * @param {SourceMapConsumer} original
 * @param {string} specifier
 * @returns {string}
 */
function buildSourceMapComment(magic, original, specifier) {
  const generator = new SourceMapGenerator({ file: specifier });
  generator.applySourceMap(original, specifier);
  generator.applySourceMap(magic, specifier);
  return fromObject(generator.toJSON()).toComment();
}

/**
 * @param {string} source
 * @returns {Promise<SourceMapConsumer| null>}
 */
async function InlineConsumer(source) {
  const comment = source.indexOf("//# sourceMappingURL=");

  if (comment === -1) return null;

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
  const sourcemap = /** @type {import("magic-string").SourceMap}*/ (
    fromComment(source.slice(comment)).toObject()
  );
  return new SourceMapConsumer(sourcemap);
}
