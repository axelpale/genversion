#!/usr/bin/env node

const gv = require('../lib/genversion')
const v = require('../lib/version')
const csvToArray = require('../lib/csvToArray')
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
  .option('-e, --esm', 'use ESM exports in generated code')
  .option('    --es6', 'alias for --esm flag')
  .option('-u, --strict', 'add "use strict" in generated code')
  .option('-p, --source <path>', 'search for package.json along a custom path')
  .option('-P, --property <key>', 'select properties; default is "version"')
  .option('-a, --apply <var>', 'replace variable in the target file')
  .option('-c, --check-only', 'check if the version module is up to date')
  .option('-f, --force', 'force file rewrite upon generation')
  .action((target, cliOpts) => {
    if (typeof target !== 'string' || target === '') {
      console.error('Missing argument: target')
      return process.exit(1)
    }
    // TODO const targetBase = path.basename(target)

    // Short alias for verbosity as we use it a lot
    const verbose = cliOpts.verbose

    // Read properties. Open comma separated list
    cliOpts.properties = csvToArray(cliOpts.property)
    if (cliOpts.properties.length === 0) {
      cliOpts.properties = ['version']
    }

    // Read variables. Open comma separated list from --apply.
    // Interacts with --property flag.
    if (cliOpts.apply === '') {
      console.error('List of applicable variables cannot be empty.')
      return process.exit(1)
    }
    const variables = {}
    const variableMap = csvToArray(cliOpts.apply)
    for (let i = 0; i < variableMap.length; i += 1) {
      const mapping = variableMap[i]
      const parts = mapping.split(':')
      if (parts.length === 1) {
        // Use properties respectively.
        if (!cliOpts.properties[i]) {
          console.error('No properties found to apply to variable ' +
          '"' + mapping + '". ' +
          'Ensure you specify equal number of properties and variables.')
          return process.exit(1)
        }
        const prop = cliOpts.properties[i]
        variables[prop] = mapping
      } else if (parts.length === 2) {
        // Property name inside the map
        const prop = parts[0]
        const variable = parts[1]
        variables[prop] = variable
      } else {
        console.error('Variable name cannot have colons "' + mapping + '"')
        return process.exit(1)
      }
    }

    // Options for check and generate
    const opts = {
      properties: cliOpts.properties,
      useSemicolon: cliOpts.semi,
      useDoubleQuotes: cliOpts.double,
      useBackticks: cliOpts.backtick,
      useEs6Syntax: cliOpts.es6 || cliOpts.esm,
      useStrict: cliOpts.strict,
      source: cliOpts.source,
      force: cliOpts.force
    }

    // Default source path from which to search for the package.json.
    if (typeof cliOpts.source !== 'string' || cliOpts.source === '') {
      cliOpts.source = target
    }

    if (cliOpts.apply) {
      const options = { source: cliOpts.source }
      gv.apply(target, variables, options, (err, result) => {
        if (err) {
          console.error(err.toString())
          return process.exit(1)
        }

        if (!result.doesExist) {
          console.warn('Could not apply. Target file does not exist: ' + target)
          return process.exit(1)
        }

        if (!result.wasModified) {
          // TODO count modifications
          console.warn('Could not apply. No matching variables found in ' +
            'target: ' + target)
          return process.exit(0)
        }

        if (verbose) {
          const n = Object.keys(variables).length // TODO count real replaces
          console.log('Properties were applied to ' + n + ' variables ' +
            'in the target file successfully.')
        }
        return process.exit(0)
      })

      return
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
