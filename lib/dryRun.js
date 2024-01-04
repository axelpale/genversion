const makeAbsolute = require('./makeAbsolute')
const findPackage = require('find-package')
const createContent = require('./versionTools').createContent

module.exports = (targetPath, opts, callback) => {
  // Dry-run version submodule generation.
  // Works as a preprocessing step for exports.generate
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
  //         file path string. A path to package.json
  //       useSemicolon
  //         boolean. Set true to use semicolons in generated code
  //       useDoubleQuotes
  //         boolean. Set true to use double quotes in generated code
  //         instead of single quotes.
  //       useBackticks
  //         boolean. Set true to use backticks in generated code
  //         instead of single or double quotes.
  //       useEs6Syntax
  //         boolean. Set true to use ES6 export syntax
  //       useStrict:
  //         boolean. Add the 'use strict' header
  //   callback
  //     function (err, dryRunResult)
  //       err
  //         null if generated successfully
  //         non-null if no package.json found or version in it is invalid
  //       dryRunResult, object with props:
  //         absoluteTargetPath
  //           absolute path of the target version submodule
  //         completeOptions
  //           validated and filled options object
  //         version
  //           new version string, undefined on error
  //         generatedContent
  //           string, contents for the new version submodule
  //

  // Detect invalid path
  if (typeof targetPath !== 'string') {
    throw new Error('Unexpected targetPath argument')
  }
  // Handle callback fn in place of options.
  if (typeof callback !== 'function') {
    if (typeof opts !== 'function') {
      throw new Error('Unexpected callback argument')
    } else {
      callback = opts
      opts = {}
    }
  }
  // Detect invalid options
  if (typeof opts !== 'object') {
    throw new Error('Unexpected opts argument')
  }

  if (typeof opts.useSemicolon !== 'boolean') {
    opts.useSemicolon = false // default
  }

  if (typeof opts.useDoubleQuotes !== 'boolean') {
    opts.useDoubleQuotes = false // default
  }

  if (typeof opts.useBackticks !== 'boolean') {
    opts.useBackticks = false // default
  }

  if (typeof opts.useEs6Syntax !== 'boolean') {
    opts.useEs6Syntax = false // default
  }

  if (typeof opts.useStrict !== 'boolean') {
    opts.useStrict = false // default
  }

  if (typeof opts.source !== 'string') {
    opts.source = targetPath // default
  }

  if (!Array.isArray(opts.properties) || opts.properties.length === 0) {
    opts.properties = ['version']
  }

  const absTarget = makeAbsolute(targetPath)
  const absSource = makeAbsolute(opts.source)

  // Find closest package.json from the target towards filesystem root
  const pjson = findPackage(absSource)

  // findPackage returns null if not found
  if (pjson === null) {
    const err = new Error('No package.json found along path ' + absSource)
    return callback(err)
  }

  // Pick selected properties from package
  const packageProperties = opts.properties.reduce((acc, key) => {
    if (key in pjson) {
      acc[key] = pjson[key]
    }
    return acc
  }, {})
  // Pick version always regardless of parameters.
  const version = pjson.version

  // Ensure version is a string
  if (typeof version !== 'string') {
    const err = new Error('Invalid version in package.json: ' + version)
    return callback(err)
  }

  const generatedContent = createContent(packageProperties, opts)

  return callback(null, {
    absoluteTargetPath: absTarget,
    completeOptions: opts,
    version,
    generatedContent
  })
}
