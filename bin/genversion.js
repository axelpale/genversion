#!/usr/bin/env node

const gv = require('../index')
const csvToArray = require('../lib/csvToArray')
const commander = require('commander')
const path = require('path')

// Setup
const program = commander.program

program
  .arguments('<target>')
  .description('Generates a version module at the target filepath.')
  .option('-s, --semi', 'use semicolons in generated code')
  .option('-d, --double', 'use double quotes in generated code')
  .option('-b, --backtick', 'use backticks in generated code')
  .option('-e, --esm', 'use ESM exports in generated code')
  .option('    --es6', 'alias for --esm flag')
  .option('-u, --strict', 'add "use strict" in generated code')
  .option('-c, --check-only', 'check if target is up to date')
  .option('-f, --force', 'force file rewrite upon generation')
  .option('-p, --source <path>', 'search for package.json along a custom path')
  .option('-P, --property <key>', 'select properties; default is "version"')
  .option('-t, --template <path>', 'generate with a custom template')
  .option('    --template-engine <name>',
    'select template engine; default is "ejs"')
  .option('-v, --verbose', 'increased output verbosity')
  .version(gv.version, '-V, --version', 'output genversion\'s own version')
  .action((target, cliOpts) => {
    if (typeof target !== 'string' || target === '') {
      console.error('Missing argument: target')
      process.exitCode = 1
      return
    }
    // Short alias for basename used a lot in log output
    const targetBase = path.basename(target)

    // Short alias for verbosity as we use it a lot
    const verbose = cliOpts.verbose

    // Read properties. Open comma separated list
    if (cliOpts.property && cliOpts.property.startsWith('-')) {
      // Detect forgotten property list (argument becomes the next flag)
      console.error('error: property cannot be empty.')
      process.exitCode = 1
      return
    }
    cliOpts.properties = csvToArray(cliOpts.property)
    if (cliOpts.properties.length === 0) {
      cliOpts.properties = ['version']
    }

    // Options for check and generate
    const opts = {
      properties: cliOpts.properties,
      source: cliOpts.source,
      template: cliOpts.template,
      templateEngine: cliOpts.templateEngine || 'ejs',
      useSemicolon: cliOpts.semi,
      useDoubleQuotes: cliOpts.double,
      useBackticks: cliOpts.backtick,
      useEs6Syntax: cliOpts.es6 || cliOpts.esm,
      useStrict: cliOpts.strict
    }

    // Default source path from which to search for the package.json.
    if (typeof cliOpts.source !== 'string' || cliOpts.source === '') {
      cliOpts.source = target
    }

    if (cliOpts.checkOnly) {
      gv.check(target, opts, (err, doesExist, isByGv, isUpToDate) => {
        if (err) {
          console.error(err.toString())
          process.exitCode = 1
          return
        }

        let exitCode = 1
        if (doesExist) {
          if (isByGv) {
            if (isUpToDate) {
              exitCode = 0
            } else {
              exitCode = 2
            }
          } else {
            exitCode = 2
          }
        }

        if (verbose) {
          switch (exitCode) {
            case 0:
              console.log('The version module ' + targetBase +
                ' is up to date.')
              break
            case 1:
              console.error('The version module ' + targetBase +
                ' could not be found.')
              break
            case 2:
              console.error('The version module ' + targetBase +
                ' has outdated or unknown content.')
              break
            default:
              throw new Error('Unknown exitCode: ' + exitCode)
          }
        }

        process.exitCode = exitCode
      })
      // check completed, exit without generation
      return
    }

    gv.check(target, opts, (err, doesExist, isByGenversion) => {
      if (err) {
        console.error(err.toString())
        process.exitCode = 1
        return
      }

      if (doesExist) {
        if (isByGenversion) {
          gv.generate(target, opts, (errg, version) => {
            if (errg) {
              console.error(errg)
              process.exitCode = 1
              return
            }

            if (verbose) {
              console.log('Version module ' + targetBase +
                ' was successfully updated to ' + version)
            }
          })
        } else if (cliOpts.force) {
          // Forcefully rewrite unknown file.
          if (verbose) {
            console.warn('File ' + targetBase +
              ' will be forcefully overwritten.')
          }

          gv.generate(target, opts, (errg, version) => {
            if (errg) {
              console.error(errg)
              process.exitCode = 1
              return
            }

            if (verbose) {
              console.log('Version module ' + targetBase +
                ' was successfully generated with version ' + version)
            }
          })
        } else {
          // FAIL, unknown file, do not replace
          console.error(
            'ERROR: Target file ' + target + ' exists and it has unexpected ' +
            'content. To be safe, the file will not be replaced. ' +
            'Please ensure that the file is not important and ' +
            'remove it manually before retry.'
          )
          process.exitCode = 1
        }
      } else {
        // OK, file does not exist.
        gv.generate(target, opts, (errg, version) => {
          if (errg) {
            console.error(errg)
            process.exitCode = 1
            return
          }

          if (verbose) {
            console.log('Version module ' + targetBase +
              ' was successfully generated with version ' + version)
          }
        })
      }
    })
  })

// Additional newline after help
program.addHelpText('after', ' ')

program.parse(process.argv)

if (program.args.length === 0) {
  console.error('ERROR: Missing argument <target>')
  program.outputHelp()
}
