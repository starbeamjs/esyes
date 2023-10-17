import { openSync, writeSync } from "node:fs";

import MagicString from "magic-string";

/**
 * @typedef {{before: number; after: number; string: string}} CodeMatch
 * @typedef {{before: number; after: number}} CodeRange
 */

export class SourceBuffer {
  /** @readonly @type {string} */
  #source;

  /** @readonly @type {MagicString} */
  #magic;

  /**
   * @type {number}
   */
  #offset;

  /**
   * @param {string} source
   */
  constructor(source) {
    this.#source = source;
    this.#magic = new MagicString(source);
    this.#offset = 0;
  }

  /**
   * @template {import("magic-string").SourceMapOptions | undefined} Options
   * @param {Options} options
   * @returns {Options extends undefined ? {code: string } : {code:string, map: import("magic-string").SourceMap}}
   */
  done(options) {
    /**
     * @type {{code: string; map?: import("magic-string").SourceMap}}
     */
    const result = {
      code: this.#magic.toString(),
    };

    if (options) {
      result.map = this.#magic.generateMap(options);
    }

    return /** @type {any} */ (result);
  }

  /**
   * @param {CodeRange} range
   * @param {string} replacement
   */
  replace(range, replacement) {
    log("replacing", {
      range: formatRange([range.before, range.after]),
      with: replacement,
    });

    this.#magic.overwrite(range.before, range.after, replacement);
  }

  /**
   * @param {string} string
   * @returns {null | CodeMatch}
   */
  getNext(string) {
    const index = this.#source.slice(this.#offset).indexOf(string);

    if (index === -1) {
      log(`search for ${JSON.stringify(string)}`, "not found");
      return null;
    }

    log(`search for ${JSON.stringify(string)} (from ${this.#offset})`, {
      "found at": index,
    });

    const start = this.#offset + index;
    this.#offset += index + string.length;

    return {
      before: start,
      after: this.#offset,
      string,
    };
  }

  /**
   * @param {string | RegExp} pattern
   * @returns {null | CodeMatch}
   */
  lookahead(pattern) {
    if (typeof pattern === "string") {
      return this.#lookaheadString(pattern);
    } else {
      return this.#lookaheadPattern(pattern);
    }
  }

  /**
   * @param {string} string
   * @returns {null | CodeMatch}
   */
  #lookaheadString(string) {
    if (!this.#source.startsWith(string, this.#offset)) {
      log(`lookahead for ${JSON.stringify(string)}`, "not found");
      return null;
    }

    const before = this.#offset;
    this.#offset += string.length;

    log(`lookahead for ${JSON.stringify(string)}`, {
      found: formatRange([before, this.#offset]),
    });

    return {
      before,
      after: this.#offset,
      string,
    };
  }

  /**
   * @param {RegExp} pattern
   * @returns {null | CodeMatch}
   */
  #lookaheadPattern(pattern) {
    const remainder = this.#source.slice(this.#offset);
    const match = pattern.exec(remainder);

    if (match === null) {
      log(`lookahead for ${pattern}`, "not found");
      return null;
    }

    const before = this.#offset;
    const string = match[0];
    this.#offset += string.length;

    log(`lookahead for ${pattern}`, {
      found: formatRange([before, this.#offset]),
    });

    return {
      before,
      after: this.#offset,
      string,
    };
  }
}
const LOADER_LOG = process.env["EYES_LOADER_LOG"];
const LOGGER = LOADER_LOG ? openSync(LOADER_LOG, "w+") : null;
/**
 * @typedef {string | number | boolean | null} JsonPrimitive
 * @typedef {JsonValue[]} JsonArray
 * @typedef {JsonPrimitive | JsonArray | { [key: string]: JsonValue }} JsonValue
 */
/**
 * @param {string} section
 * @param  {JsonValue} log
 */
export function log(section, log) {
  if (!LOGGER) return;

  writeSync(LOGGER, stringify({ [section]: log }, 0));

  /**
   * @param {JsonValue} json
   * @param {number} pad
   * @returns {string}
   */
  function stringify(json, pad) {
    const padding = " ".repeat(pad);

    switch (typeof json) {
      case "string":
      case "number":
      case "boolean":
        return JSON.stringify(json);
      default: {
        if (json === null) {
          return "null";
        }

        if (Array.isArray(json)) {
          return json
            .map((j) => `\n${padding}- ${stringify(j, pad + 2)}`)
            .join("");
        }

        return Object.entries(json)
          .map(([k, v]) => `\n${padding}${k}: ${stringify(v, pad + 2)}`)
          .join("");
      }
    }
  }
}
/**
 * @param {[before: number, after: number]} range
 */
function formatRange([before, after]) {
  return `${before}..${after}`;
}
