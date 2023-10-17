# esyes

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Run your TypeScript files quickly and with more positivity.

`esyes` transforms your JavaScript and TypeScript files using
[`esbuild-kit`](https://github.com/esbuild-kit). It works seamlessly and
requires no configuration to get the job done.

It also translates [`import.meta.env` features](#importmetaenv) on the fly, so
you can use JavaScript or TypeScript modules written with `import.meta.env`
directly in Node.

> Hat tip to @NullVoxPopuli for the idea, originally implemented in [this PR](https://github.com/starbeamjs/starbeam/pull/126) in the Starbeam repository.

## Table of Contents

- [Install](#install)
- [Usage: Instead of the `node` Command](#usage-instead-of-the-node-command)
- [Usage: As a Loader](#usage-as-a-loader)
- [`import.meta.env` Support](#importmetaenv-support)
- [Advanced: Internals Tracing](#advanced-internals-tracing)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Install

When using `esyes` to run npm scripts, install via your package manager.

```sh
$ pnpm i -D esyes
```

You can also install esyes globally via your package manager.

```sh
$ pnpm i -g esyes
```

You can also install `esyes` with [volta](https://volta.sh/), which allows you
to bind it to a node version.

```sh
$ volta install esyes node@20
```

> If you install `esyes` via volta and you're using it in a project with a [pinned version of Node](https://docs.volta.sh/reference/pin) in its
> package.json, `esyes` will automatically use that version.

## Usage: Instead of the `node` Command

```sh
$ cat hi.ts
const hello = "hello" as const;
console.log(hello);

$ esyes hi.ts
hello
```

All node flags and environment variables are passed through to node, so it's a
true drop-in replacement for the `node` command.

> There's one divergence: `node` without any arguments will run the Node REPL,
> while `esyes` with no arguments prints usage information.

## Usage: As a Loader

You can use `esyes` directly as a [Node
loader](https://nodejs.org/api/module.html#customization-hooks) **without any
experimental warnings.**

```sh
$ cat hi.ts
const hello = "hello" as const;
console.log(hello);

$ node --import esyes hi.ts
hello
```

> `esyes` uses Node's new [module.register](https://nodejs.org/api/module.html#:~:text=COPY-,module.register) API. This is the API that the warnings you might have seen advise you to use.

## `import.meta.env` Support

`esyes` will automatically transform many of the `import.meta.env` features
[supported by Vite](https://vitejs.dev/guide/env-and-mode.html) so that you can
use them directly in your JavaScript or TypeScript code.

```sh
$ cat hi.ts
const hello = "hello" as const;

if (import.meta.env.DEV) {
  console.log(hello);
} else {
  console.log("not in dev mode!");
}

$ node --import esyes hi.ts
hello

$ MODE=prod node --import esyes hi.ts
not in dev mode
```

This transform applies to all files, including files in your `node_modules`,
which makes using `import.meta.env` transparent, even if some of the code you're
working on is in node_modules (such as when working in monorepos).

The transform is expected to be extremely fast when no `import.meta.env` is used
(it just does a quick check for `import.meta.env` before doing any other work).

## Advanced: Internals Tracing

If the loader isn't doing what you expect, you can enable trace logging to see
all of the files that the loader is processing, and the processing steps it's
taking.

```sh
$ cat hi.ts
const hello = "hello" as const;

if (import.meta.env.DEV) {
  console.log(hello);
} else {
  console.log("not in dev mode!");
}

$ EYES_LOADER_LOG=log.txt node --import esyes hi.ts
hello

$ cat log.txt
load: "file:///.../hi.ts"
search for "import.meta.env" (from 0):
  found at: 23
lookahead for ".":
  found: "38..39"
lookahead for /^(MODE|DEV|PROD|TRACE)/:
  found: "39..42"
replacing:
  range: "23..42"
  with: "true"
search for "import.meta.env": "not found"
```

## Maintainers

[The Starbeam team](https://github.com/starbeamjs/.github/blob/main/TEAM.md).

## Contributing

See [the contributing file](CONTRIBUTING.md)!

## License

MIT © 2023 Yehuda Katz
