# genversion

![Logo](doc/genversion-logo-halo.png?raw=true "Abracadabra...and behold!")

[![Travis build status](https://img.shields.io/travis/com/axelpale/genversion)](https://app.travis-ci.com/github/axelpale/genversion)
[![npm version](https://img.shields.io/npm/v/genversion?color=green)](https://www.npmjs.com/package/genversion)
[![license](https://img.shields.io/npm/l/genversion)](#license)
[![npm downloads](https://img.shields.io/npm/dm/genversion?color=green)](https://www.npmjs.com/package/genversion)
[![Node Version](https://img.shields.io/node/v/genversion.svg)](https://github.com/axelpale/genversion)

So you want `yourmodule.version` to follow the version in package.json but are tired of updating it manually every time the version changes? Could you just `require('./package.json').version` or `import { version } from './package.json'`? That works **but** for your client side apps, that would bundle the whole package.json and thus expose the versions of your dependencies and possibly other sensitive data too. [It is usually a naughty thing to do!](https://stackoverflow.com/a/10855054/638546) How to import only the version? Genversion to the rescue!

> YES!!! This is the right answer. Nobody should be shipping their package.json file with their app. &mdash; <cite><a href="https://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code/10855054#comment119380617_46582508" target="_blank">Eric Jorgensen</a></cite>

[Try it out](#try-it-out) – [Integrate to your build](#integrate-to-your-build) – [Command line API](#command-line-api) – [Node API](#node-api) – [Contribute](#contribute) – [Artwork](#artwork)

## Try it out

Usage is simple:

    $ cd yourmodule
    $ npm install genversion
    $ npx genversion version.js

Voilà! The new `version.js`:

    // Generated by genversion.
    module.exports = '1.2.3'

Use [flags](#command-line-api) to match your coding style. `$ genversion --esm --semi version.js` creates:

    // Generated by genversion.
    export const version = '1.2.3';

Need more data? Try `$ genversion --property name,version version.js`:

    // Generated by genversion.
    exports.name = 'yourmodule';
    exports.version = '1.2.3';

[Node API](#node-api) is also available:

    > const gv = require('genversion')
    > gv.generate('lib/version.js', { useSemicolon: true }, (err) => { ... })

See [API documentation](#command-line-api) below for details.

## Integrate to your build

The following describes the basic way to use genversion as a part of your workflow. See [Advanced integration](#advanced-integration) for alternative ways that might suit you better.

First install via [npm](https://www.npmjs.com/package/genversion).

    $ npm install genversion --save-dev

Genversion works by reading the current version from your package.json and then generating a module file that exports the version tag. For clarity, the file begins with a signature that tells both genversion and human readers that the file may be overwritten in future:

    // Generated by genversion.
    module.exports = '1.2.3'

Therefore, your job is to 1) choose a target path for the module file, 2) import the new module into your project, and 3) add genversion to your build or release pipeline. For example, let us choose the path `lib/version.js` and expose it via `yourmodule/index.js` as follows:

    ...
    exports.version = require('./lib/version')

If your project uses ECMAScript modules, you need to call genversion with `--esm`. In this case expose the version in `yourmodule/index.js` like this:

    ...
    import { version } from './lib/version'
    export const version

Then, let's add genversion into your build pipeline in `package.json` for example like this:

    "scripts": {
      "build": "genversion lib/version.js && other build stuff"
    }

Altenatively, you might prefer adding genversion as a script and run it only upon a release:

    "scripts": {
      ...
      "gv": "genversion lib/version.js",
      "release": "npm run gv && npm run build && npm test && npm publish"
    }

If you use [npm version](https://docs.npmjs.com/cli/v10/commands/npm-version) for your version increments and like to run genversion as a `postversion` script, see [advanced integration](#advanced-integration).

Finished! Now your module has a version property that matches with your package.json and is updated every time you build or release the project.

    > var yourmodule = require('yourmodule')
    > yourmodule.version
    '1.2.3'

Great! Having a version property in your module is very convenient for debugging. More than once we have painstakingly debugged a module, just to find out that it was a cached old version that caused the error. An inspectable version property would have helped a big time.


## Command line API

Directly from `$ genversion --help`:

```
Usage: genversion [options] <target>

Generates a version module at the target filepath.

Options:
  -s, --semi                   use semicolons in generated code
  -d, --double                 use double quotes in generated code
  -b, --backtick               use backticks in generated code
  -e, --esm                    use ESM exports in generated code
      --es6                    alias for --esm flag
  -u, --strict                 add "use strict" in generated code
  -c, --check-only             check if target is up to date
  -f, --force                  force file rewrite upon generation
  -p, --source <path>          search for package.json along a custom path
  -P, --property <key>         select properties; default is "version"
  -t, --template <path>        generate with a custom template
      --template-engine <name> select template engine; default is "ejs"
  -v, --verbose                increased output verbosity
  -V, --version                output genversion's own version
  -h, --help                   display help for command
```

The `target` path is given as the first argument after options. If the file already exists and has been previously created by genversion, it will be replaced. If the file exists but it looks like it was not created by genversion, you will see a warning, genversion exits with the exit code 1, and the file stays untouched unless you use `--force`.

### -s, --semi

End each generated line of code with a semicolon as required by some style guides.

### -d, --double

Use double quotes `"` instead of single quotes `'` as required by some style guides.

### -b, --backtick

Use backticks `` ` `` instead of single `'` or double `"` quotes as required by some style guides.

### -e, --esm, --es6

Use ECMAScript module export statement syntax `export const` instead of `module.exports` in the generated code. Prefer `--esm` because `--es6` might be deprecated in future.

### -u, --strict

Prepend each generated file with `'use strict'` as required by some style guides.

### -c, --check-only

When `--check-only` flag is used, only the existence and validity of the version module is checked. No files are generated or modified. The flag is useful for pre-commit hooks and similar.

The command exits with the exit code:
  - `0` if the version module is found and is exactly as freshly generated.
  - `1` if the version module cannot be found.
  - `2` if the version module is found but needs a refresh. This exit code can occur after version increment or when the version module formatting has changed. Also, if a version module is found but is not made by genversion, the command will exit with this exit code.

The command with `--check-only` does not produce any output by default. Use `-v` to increase its verbosity.

### -f, --force

Force rewrite of possibly pre-existing file at the target path. Otherwise genversion will rewrite the file only if it looks like it was created by genversion.

### -p, --source <path>

By default, genversion finds and reads `package.json` nearest to the target path. In case your `package.json` is located somewhere else or you have multiple `package.json` files along the path, you can select the one with `--source <path>` parameter.

### -P, --property <key>

Select which property or properties will be picked from package.json and inserted into the generated module. Specify multiple properties with a comma separated list without spaces, for example `-P name,version`. Note that with two or more properties and without `--esm` flag the module is generated with `exports` instead of `module.exports`.

### -t, --template <path>

Use a custom template instead of the default template when generating the module. The template is called with two parameters `pkg` and `options` where the former is an object containing a set of properties picked from package.json and the latter is an object containing the formatting options. The template is free to respect or neglect the parameters provided.

For example, consider the following `template.ejs`:

```
export default '<%= pkg.version %>';
```

Calling `genversion --template template.ejs lib/version.js` would generate:

```
export default '1.2.3';
```

Use `--properties` to control which package properties will be passed to the template in `pkg` object. Only `version` is passed by default.

The default template engine is [EJS](https://github.com/mde/ejs). You can select another templating engine with `--template-engine`, given that genversion supports it.

### --template-engine <name>

Select which template engine to use in order to process the template file selected with `--template`. Supported template engines are: `ejs`.

### -v, --verbose

By default, genversion prints output only upon a warning or error. Use `-v` to increase verbosity.

### -V, --version

Output the genversion's own version tag.


## Node API

You can also use genversion within your code:

    const gv = require('genversion');

The available properties and functions are listed below.


### genversion.check(targetPath, opts, callback)

Check if it is possible to generate the version module into `targetPath`. Check also does the file need an update.

**Parameters:**

- *targetPath:* string. An absolute or relative file path. Relative to `process.cwd()`.
- *opts:* optional options. Available keys are:
  - *properties:* optional array of strings. These properties will be picked from `package.json` and rendered. Defaults to `['version']`.
  - *source:* optional string. An absolute or relative path to a file or directory. Genversion searches for the source package.json along this path. Defaults to the value of `targetPath`.
  - *template:* optional string. An absolute or relative path to a custom template file.
  - *templateEngine:* optional string. Defaults to `ejs`.
  - *useSemicolon:* optional boolean. Defaults to `false`.
  - *useDoubleQuotes:* optional boolean. Defaults to `false`.
  - *useBackticks:* optional boolean. Defaults to `false`.
  - *useEs6Syntax:* deprecated alias of `useEsmSyntax`.
  - *useEsmSyntax:* optional boolean. Use ECMAScript modules. Defaults to `false`.
  - *useStrict:* optional boolean. Defaults to `false`.
- *callback:* function (err, doesExist, isByGenversion, isUpToDate), where:
  - *doesExist:* boolean. True if a file at targetPath already exists.
  - *isByGenversion:* boolean. True if the existing file seems like it has been generated by genversion.
  - *isUpToDate:* boolean. True if the existing file contents are exactly as freshly generated.

**Example:**

    gv.check('lib/version.js', function (err, doesExist, isByGv, isUpToDate) {
      if (err) {
        throw err;
      }

      if (isByGenversion) {
        gv.generate(...)
      }
      ...
    });


### genversion.generate(targetPath, opts, callback)

Read the version property from the nearest `package.json` along the `targetPath` and then generate a version module file at `targetPath`. A custom path to `package.json` can be specified with `opts.source`.

**Parameters:**

- *targetPath:* string. An absolute or relative file path. Relative to `process.cwd()`.
- *opts:* optional options. Available keys are:
  - *properties:* optional array of strings. These properties will be picked from `package.json` and rendered. Defaults to `['version']`.
  - *source:* optional string. An absolute or relative path to a file or directory. Genversion searches for the source package.json along this path. Defaults to the value of `targetPath`.
  - *template:* optional string. An absolute or relative path to a custom template file.
  - *templateEngine:* optional string. Defaults to `ejs`.
  - *useSemicolon:* optional boolean. Defaults to `false`.
  - *useDoubleQuotes:* optional boolean. Defaults to `false`.
  - *useBackticks:* optional boolean. Defaults to `false`.
  - *useEs6Syntax:* deprecated alias of `useEsmSyntax`.
  - *useEsmSyntax:* optional boolean. Use ECMAScript modules. Defaults to `false`.
  - *useStrict:* optional boolean. Defaults to `false`.
- *callback:* function (err, version). Parameter *version* is the version string read from `package.json`. Parameter *err* is non-null if `package.json` cannot be found, its version is not a string, or writing the version module fails.

**Examples:**

    gv.generate('lib/version.js', function (err, version) {
      if (err) {
        throw err;
      }
      console.log('Sliding into', version, 'like a sledge.');
    });

    gv.generate('src/v.js', { useSemicolon: true }, (err) => {
      if (err) { throw err }
      console.log('Generated version file with a semicolon.')
    })



### genversion.version

This property is a string that contains genversion's own version tag in [semantic versioning](http://semver.org/) format. Generated with genversion itself, of course ;)


## Projects using genversion

Following projects are using genversion and can work as examples of how to integrate genversion to your project.

- [genversion](https://www.npmjs.com/package/genversion)
- [poisson-process](https://www.npmjs.com/package/poisson-process)
- [tapspace](https://www.npmjs.com/package/tapspace)

Do you use genversion in your project? We are happy to mention it in the list. Just hit us with an issue or a pull request.


## Related projects

If genversion fails to fit your use case, you might want to check out the following projects by others.

- [versiony](https://github.com/ciena-blueplanet/versiony) for version increments
- [package-json-versionify](https://github.com/nolanlawson/package-json-versionify) for browserify builds
- [browserify-versionify](https://www.npmjs.com/package/browserify-versionify) for browserify builds
- [semantic-release](https://github.com/semantic-release/semantic-release) for automatic version increments
- [semver](https://github.com/npm/node-semver) for semantic version formatting


## Contribute

Pull requests and [bug reports](https://github.com/axelpale/genversion/issues) are highly appreciated.

Clone the repository:

    $ git clone git@github.com:axelpale/genversion.git

Install development tooling:

    $ cd genversion; npm install

Please test your contribution. Run the test suite:

    $ npm run test

Run only linter:

    $ npm run lint

Thank you.


### Visual Studio Code integration

If you are about to contribute using VS Code editor, you might want to configure VS Code debugger for genversion development. Create a file `.vscode/launch.json` with the following contents and adjust `args` to your liking:

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "program": "${workspaceFolder}/bin/genversion.js",
      "args": [
        "--semi",
        "--double",
        "--esm",
        "--strict",
        "--verbose",
        "target.js"
      ]
    }
  ]
}
```

## Advanced integration

Consider the following tips to further integrate genversion to your workflow.

### Integrate with npm version

You might already use the `npm version <major/minor/patch>` command to increase your package version and automatically commit the change to the version control. If so, you can integrate genversion to this workflow by hooking to a `postversion` script that will be executed whenever you run the `npm version`. Here are the steps to do this:

1. Install genversion as a dev dependency
2. Create a `postversion.sh` file with the following contents:
```sh
#!/bin/sh

lastTag=$(git describe --exact-match --abbrev=0)
genversion lib/version.js
git add lib/version.js
git commit --amend --no-edit
git tag -fa $lastTag -m $lastTag
```
3. Run `chmod +x postversion.sh` to make the script executable
4. Assign this script as the "postversion" script in `package.json`
```
{
  ...
  "scripts": {
    "postversion": "./postversion.sh"
    ...
  }
}
```

Then, when you run `npm version major/minor/patch`, genversion is automatically called and correctly amends the version commit as well.


## License

The genversion source code is released under [MIT](LICENSE) license.


## Artwork

Free [Creative Commons Attribution CC-BY](https://creativecommons.org/licenses/by/4.0/) artwork (c) Akseli Palén, Tarina Palén. The star pattern is made with [Sprinkler.js](https://github.com/axelpale/sprinkler). The font is [Bitstream Vera Sans Mono](https://en.wikipedia.org/wiki/Bitstream_Vera).

![genversion logo with stars](doc/2022-04-12_genversion_star_banner_headline_960x430_opt.png?raw=true "genversion logo with stars")

![genversion social icon](doc/2022-04-06_genversion_white_banner_code_960x430_opt.png?raw=true "genversion social icon")

![genversion code with stars](doc/2022-04-06_genversion_star_banner_code_960x430_opt.png?raw=true "genversion logo with code")

> We are made of starstuff. &mdash; Carl Sagan
