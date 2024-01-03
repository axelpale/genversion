#!/usr/bin/env node

const gv = require('../lib/genversion')
const v = require('../lib/version')
const commander = require('commander')
const path = require('path')

// Setup
const program = commander.program

program
  .version(v, '-V, --version', 'output genversion\'s own version')
  .arguments('<target>')
  .description('Generates a version module at the target filepath.')
  .option('-v, --verbose', 'increased output verbosity')
  .option('-s, --semi', 'use semicolons in generated code')
  .option('-d, --double', 'use double quotes in generated code')
  .option('-b, --backtick', 'use backticks in generated code')
  .option('-e, --es6', 'use ESM exports in generated code')
  .option('-u, --strict', 'add "use strict" in generated code')
  .option('-p, --source <path>', 'search for package.json along a custom path')
  .option('-c, --check-only', 'check if the version module is up to date')
  .option('-f, --force', 'force file rewrite upon generation')
  .action((target, cliOpts) => {
    if (typeof target !== 'string' || target === '') {
      console.error('Missing argument: target')
      return process.exit(1)
    }

    // Short alias for verbosity as we use it a lot
    const verbose = cliOpts.verbose
    // Options for check and generate
    const opts = {
      useSemicolon: cliOpts.semi,
      useDoubleQuotes: cliOpts.double,
      useBackticks: cliOpts.backtick,
      useEs6Syntax: cliOpts.es6,
      useStrict: cliOpts.strict,
      source: cliOpts.source,
      force: cliOpts.force
    }

    // Default source path from which to search for the package.json.
    if (typeof cliOpts.source !== 'string' || cliOpts.source === '') {
      cliOpts.source = target
    }

    if (cliOpts.checkOnly) {
      gv.check(target, opts, (err, doesExist, isByGv, isUpToDate) => {
        if (err) {
          console.error(err.toString())
          return process.exit(1)
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
              console.log('The version module ' + path.basename(target) +
                ' is up to date.')
              break
            case 1:
              console.error('The version module ' + path.basename(target) +
                ' could not be found.')
              break
            case 2:
              console.error('The version module ' + path.basename(target) +
                ' has outdated or unknown content.')
              break
            default:
              throw new Error('Unknown exitCode: ' + exitCode)
          }
        }

        return process.exit(exitCode)
      })
      // check completed, exit without generation
      return
    }

    gv.check(target, opts, (err, doesExist, isByGenversion) => {
      if (err) {
        console.error(err.toString())
        return process.exit(1)
      }

      if (doesExist) {
        if (isByGenversion) {
          gv.generate(target, opts, (errg, version) => {
            if (errg) {
              console.error(errg)
              return
            }

            if (verbose) {
              console.log('Version module ' + path.basename(target) +
                ' was successfully updated to ' + version)
            }
          })
        } else if (opts.force) {
          // Forcefully rewrite unknown file.
          if (verbose) {
            console.warn('File ' + path.basename(target) +
              ' will be forcefully overwritten.')
          }

          gv.generate(target, opts, (errg, version) => {
            if (errg) {
              console.error(errg)
              return
            }

            if (verbose) {
              console.log('Version module ' + path.basename(target) +
                ' was successfully generated with version ' + version)
            }
          })
        } else {
          // FAIL, unknown file, do not replace
          console.error(
            'ERROR: File ' + target + ' is not generated by genversion and ' +
            'therefore will not be replaced. Please ensure that the file can ' +
            'be destroyed and remove it manually before retry.'
          )
        }
      } else {
        // OK, file does not exist.
        gv.generate(target, opts, (errg, version) => {
          if (errg) {
            console.error(errg)
            return
          }

          if (verbose) {
            console.log('Version module ' + path.basename(target) +
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
