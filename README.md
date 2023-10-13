# esyes

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Run your TypeScript files quickly and with more positivity.

> Hat tip to @NullVoxPopuli for the idea, originally implemented in [this PR](https://github.com/starbeamjs/starbeam/pull/126) in the Starbeam repository.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
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

Or via volta.

```sh
$ volta install esyes
```

## Usage

```
$ cat hi.ts
const hello = "hello" as const;
console.log(hello);

$ esyes hi.ts
hello
```

## Maintainers

[The Starbeam team](https://github.com/starbeamjs/.github/blob/main/TEAM.md).

## Contributing

See [the contributing file](CONTRIBUTING.md)!

## License

MIT © 2023 Yehuda Katz
