const dryRun = require('./dryRun')
const path = require('path')
const fs = require('fs')

module.exports = (targetPath, opts, callback) => {
  // Generate version submodule file to targetPath with utf-8 encoding.
  //
  // Parameters:
  //   targetPath
  //     string. absolute or relative path
  //   opts
  //     optional object with optional properties:
  //       properties
  //         an array of string. The keys of properties to pick from
  //         .. package.json. Default is `['version']`.
  //       source
  //         a file path string. A path to package.json
  //       useSemicolon
  //         a boolean. Set true to use semicolons in generated code
  //       useDoubleQuotes.
  //         a boolean. Set true to use double quotes in generated code
  //         instead of single quotes.
  //       useBackticks
  //         a boolean. Set true to use backticks in generated code
  //         instead of single or double quotes.
  //       useEsmSyntax
  //         a boolean. Set true to use ECMAScript module syntax.
  //         .. Alias: useEs6Syntax
  //       useStrict:
  //         a boolean. Add the 'use strict' header.
  //   callback
  //     function (err, version)
  //       err
  //         null if generated successfully
  //         non-null if no package.json found or version in it is invalid
  //       version
  //         new version string, undefined on error
  //
  if (typeof callback !== 'function') {
    if (typeof opts !== 'function') {
      throw new Error('Unexpected callback argument')
    } else {
      callback = opts
      opts = {}
    }
  }

  dryRun(targetPath, opts, (err, result) => {
    if (err) {
      return callback(err)
    }

    const absTarget = result.absoluteTargetPath
    const absTargetDir = path.dirname(absTarget)
    const content = result.generatedContent
    const version = result.version

    // Ensure directory exists before writing file
    fs.mkdir(absTargetDir, { recursive: true }, errp => {
      if (errp) {
        return callback(errp)
      }

      fs.writeFile(absTarget, content, 'utf8', errw => {
        if (errw) {
          return callback(errw)
        }
        return callback(null, version)
      })
    })
  })
}
