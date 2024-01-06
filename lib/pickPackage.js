const makeAbsolute = require('./makeAbsolute')
const findPackage = require('find-package')

module.exports = (path, properties) => {
  // Pick properties from package.json.
  //
  // Parameters:
  //   path
  //     a string
  //   properties
  //     an array of string, the names of properties to pick.
  //
  // Return
  //   an object
  //
  // Throws if no package.json found along the path.
  //
  const absSource = makeAbsolute(path)

  // Find closest package.json from the target towards filesystem root
  const pjson = findPackage(absSource)

  // findPackage returns null if not found
  if (pjson === null) {
    throw new Error('No package.json found along path ' + absSource)
  }

  // Pick selected properties from package
  const subjson = properties.reduce((acc, key) => {
    if (key in pjson) {
      acc[key] = pjson[key]
    }
    return acc
  }, {})

  return subjson
}
