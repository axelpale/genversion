const path = require('path')

module.exports = (target) => {
  // Make target path absolute.
  // See https://stackoverflow.com/a/30450519/638546
  //
  if (path.isAbsolute(target)) {
    return target
  }

  return path.resolve(process.cwd(), target)
}
