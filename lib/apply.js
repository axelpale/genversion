const fs = require('fs')
const makeAbsolute = require('./makeAbsolute')
const pickPackage = require('./pickPackage')

module.exports = (targetPath, variables, options, callback) => {
  // Apply properties to variables in the target file.
  // In other words, replaces specified placeholder variables with
  // properties read from package.json.
  //
  // Parameters:
  //   targetPath
  //     string. absolute or relative path
  //   variables
  //     an object. A mapping from package.json property names to
  //     .. placeholder variables.
  //   options
  //     optional object with optional properties:
  //       source
  //         a file path string. A path to package.json
  //   callback
  //     function (err, result)
  //       err
  //         null if applied successfully
  //       result
  //         an object with properties:
  //           doesExist
  //             a boolean, true if target file exist
  //           wasModified
  //             a boolean, true if target file was modified
  //
  if (typeof callback !== 'function') {
    if (typeof options !== 'function') {
      throw new Error('Unexpected callback argument')
    } else {
      callback = options
      options = {}
    }
  }

  // TODO read encoding from options
  const encoding = 'utf8'

  targetPath = makeAbsolute(targetPath)
  const sourcePath = makeAbsolute(options.source || targetPath)
  // Get properties from package.json
  const pjson = pickPackage(sourcePath, Object.keys(variables))

  // Process variables into regular expression
  const processors = []
  Object.keys(variables).forEach(property => {
    const variable = variables[property]
    const expression = '["\'`]' + variable + '["\'`]'
    const value = pjson[property]
    const replacer = (typeof value === 'string'
      ? '"' + value + '"'
      : JSON.stringify(value)
    )

    processors.push({
      expression: new RegExp(expression),
      replacer
    })
    // Check for unquoted match
    processors.push({
      expression: new RegExp(variable),
      replacer
    })
  })

  // TODO process large files in chunks
  let contents = ''

  try {
    contents = fs.readFileSync(targetPath, encoding)
  } catch (e) {
    // TODO detect nonexisting file.
    return callback(null, {
      doesExist: false,
      wasModified: false,
      modifications: 0
    })
  }

  let modifications = 0
  const newContents = processors.reduce((acc, processor) => {
    const accc = acc.replace(processor.expression, processor.replacer)
    if (accc !== acc) modifications += 1
    return accc
  }, contents)

  const wasModified = (contents !== newContents)

  // Contents changed and not a dry run? Write to file
  if (wasModified) {
    try {
      fs.writeFileSync(targetPath, newContents, encoding)
    } catch (e) {
      // Write error
      console.error(e)
      return callback(e)
    }
  }

  const result = {
    doesExist: true,
    wasModified,
    modifications
  }
  return callback(null, result)
}
