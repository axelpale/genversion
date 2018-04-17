#!/usr/bin/env node

var gv = require('../lib/genversion')
var v = require('../lib/version')
var program = require('commander')
var path = require('path')

var increaseVerbosity = function (verb, total) {
  return total + 1
}

program
  .version(v)
  .usage('[options] <target>')
  .description('Generates a version module at the target filepath.')
  .option('-v, --verbose', 'output the new version', increaseVerbosity, 0)
  .option('-s, --semi', 'use semicolons in generated code')
  .option('-e, --es6', 'use es6 syntax in generated code')
  .action(function (target) {
    gv.check(target, function (err, doesExist, isByGenversion) {
      if (err) {
        console.error(err.toString())
        process.exit(1)
      }

      if (doesExist) {
        if (isByGenversion) {
          gv.generate(target, {
            useSemicolon: program.semi,
            useEs6Syntax: program.es6
          }, function (errg, version) {
            if (errg) {
              console.error(errg)
              return
            }

            if (program.verbose >= 1) {
              console.log('File ' + path.basename(target) +
                ' was successfully updated to ' + version)
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
        gv.generate(target, {
          useSemicolon: program.semi,
          useEs6Syntax: program.es6
        }, function (errg, version) {
          if (errg) {
            console.error(errg)
            return
          }

          if (program.verbose >= 1) {
            console.log('File ' + path.basename(target) +
              ' was successfully generated with version ' + version)
          }
        })
      }
    })
  })

program.on('--help', function () {
  // Additional newline.
  console.log('')
})

program.parse(process.argv)

if (program.args.length === 0) {
  console.error('ERROR: Missing argument <target>')
  program.outputHelp()
}