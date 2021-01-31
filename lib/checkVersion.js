var fs = require('fs')
var createContent = require('./versionTools').createContent
var makeAbsolute = require('./makeAbsolute')
var findPackage = require('find-package')

exports.check = function (targetPath, opts, callback) {
  // Generate version submodule file to targetPath with utf-8 encoding.
  //
  // Parameters:
  //   targetPath
  //     string. absolute or relative path
  //   opts
  //     optional object with optional properties
  //       useSemicolon
  //         bool, true to use semicolons in generated code
  //   callback
  //     function (err, version)
  //       err
  //         null if generated successfully
  //         non-null if no package.json found or version in it is invalid
  //       version
  //         new version string, undefined on error
  //
  var absTarget, absSource, pjson, err, version

  if (typeof targetPath !== 'string') {
    throw new Error('Unexpected targetPath argument')
  }

  if (typeof callback !== 'function') {
    if (typeof opts !== 'function') {
      throw new Error('Unexpected callback argument')
    } else {
      callback = opts
      opts = {}
    }
  }

  if (typeof opts !== 'object') {
    throw new Error('Unexpected opts argument')
  }

  if (typeof opts.useSemicolon !== 'boolean') {
    opts.useSemicolon = false // default
  }

  if (typeof opts.useEs6Syntax !== 'boolean') {
    opts.useEs6Syntax = false // default
  }

  if (typeof opts.source !== 'string') {
    opts.source = targetPath // default
  }

  absTarget = makeAbsolute(targetPath)
  absSource = makeAbsolute(opts.source)

  // Find closest package.json from the target towards filesystem root
  pjson = findPackage(absSource)

  // findPackage returns null if not found
  if (pjson === null) {
    err = new Error('No package.json found along path ' + absSource)
    return callback(err)
  }

  // Get version property
  version = pjson.version

  if (!fs.existsSync(absTarget)) {
    return callback(null, 1, version)
  }

  // this is the content as it should be
  var refrerenceContent = createContent(version, opts)

  var fileContent = fs.readFileSync(absTarget).toString()

  if (refrerenceContent === fileContent) {
    return callback(null, 0, version)
  }
  return callback(null, 2, version)
}
