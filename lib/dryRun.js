const makeAbsolute = require('./makeAbsolute')
const defaultTemplate = require('./template')
const pickPackage = require('./pickPackage')
const getTemplate = require('./getTemplate')

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
  //         a file path string. A path to package.json
  //       template
  //         a file path string. A path to custom template.
  //       templateEngine
  //         a string. Defaults to 'ejs'.
  //       useSemicolon
  //         boolean. Set true to use semicolons in generated code
  //       useDoubleQuotes
  //         boolean. Set true to use double quotes in generated code
  //         instead of single quotes.
  //       useBackticks
  //         boolean. Set true to use backticks in generated code
  //         instead of single or double quotes.
  //       useEsmSyntax
  //         boolean. Set true to use ECMAScript modules syntax.
  //         .. Alias: useEs6Syntax
  //       useStrict
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
    opts.useEs6Syntax = false // default, alias
  }
  if (typeof opts.useEsmSyntax !== 'boolean') {
    opts.useEsmSyntax = false // default
  }
  opts.useEsmSyntax = opts.useEs6Syntax || opts.useEsmSyntax
  opts.useEs6Syntax = opts.useEsmSyntax
  // TODO deprecate alias: useEs6Syntax

  if (typeof opts.useStrict !== 'boolean') {
    opts.useStrict = false // default
  }

  const absTarget = makeAbsolute(targetPath)
  if (typeof opts.source !== 'string') {
    opts.source = absTarget // default
  }

  if (typeof opts.templateEngine !== 'string') {
    opts.templateEngine = 'ejs' // default
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

  // Then pick needed properties for the template.
  const templateData = {
    pkg: pickPackage(opts.source, opts.properties),
    options: opts
  }

  // And generate module.
  let generatedContent = ''
  if (opts.template) {
    // Use custom template
    let templateFn
    try {
      templateFn = getTemplate(opts.template, opts.templateEngine)
    } catch (e) {
      return callback(e)
    }
    generatedContent = templateFn(templateData)
  } else {
    // Use the default template
    generatedContent = defaultTemplate(templateData)
  }

  return callback(null, {
    absoluteTargetPath: absTarget,
    completeOptions: opts,
    version,
    generatedContent
  })
}
