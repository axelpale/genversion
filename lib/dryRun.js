const makeAbsolute = require('./makeAbsolute')
const createContent = require('./versionTools').createContent
const pickPackage = require('./pickPackage')

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

  const absTarget = makeAbsolute(targetPath)
  if (typeof opts.source !== 'string') {
    opts.source = absTarget // default
  }

  if (!Array.isArray(opts.properties) || opts.properties.length === 0) {
    opts.properties = ['version']
  }

  // Pick version always regardless of parameters.
  // TODO possibly drop version passing in v4 as unnecessary
  let versionPackage = null
  try {
    versionPackage = pickPackage(opts.source, ['version'])
    if (!versionPackage) {
      throw new Error('No package.json found.')
    }
  } catch (e) {
    return callback(e)
  }

  const version = versionPackage.version
  if (typeof version !== 'string') {
    const err = new Error('Invalid version in package.json: ' + version)
    return callback(err)
  }

  // Then pick needed
  const pjson = pickPackage(opts.source, opts.properties)
  // And generate module
  const generatedContent = createContent(pjson, opts)

  return callback(null, {
    absoluteTargetPath: absTarget,
    completeOptions: opts,
    version,
    generatedContent
  })
}
