const fs = require('fs')
const createContent = require('./versionTools').createContent
const makeAbsolute = require('./makeAbsolute')
const findPackage = require('find-package')

exports.check = (targetPath, opts, callback) => {
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

  const absTarget = makeAbsolute(targetPath)
  const absSource = makeAbsolute(opts.source)

  // Find closest package.json from the target towards filesystem root
  const pjson = findPackage(absSource)

  // findPackage returns null if not found
  if (pjson === null) {
    const err = new Error('No package.json found along path ' + absSource)
    return callback(err)
  }

  // Get version property
  const version = pjson.version

  if (!fs.existsSync(absTarget)) {
    return callback(null, 1, version)
  }

  // this is the content as it should be
  const refrerenceContent = createContent(version, opts)

  const fileContent = fs.readFileSync(absTarget).toString()

  if (refrerenceContent === fileContent) {
    return callback(null, 0, version)
  }
  return callback(null, 2, version)
}
