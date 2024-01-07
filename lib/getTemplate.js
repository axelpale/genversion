const makeAbsolute = require('./makeAbsolute')
const ejs = require('ejs')
const fs = require('fs')

module.exports = (templatePath, engine) => {
  // Create a template function from a template file at the given path
  // using the selected engine.
  //
  // Parameters:
  //   templatePath
  //     a string being absolute or relative file path.
  //   engine
  //     a string, the name of the template engine to use.
  //
  // Return:
  //   a function (data)
  //

  // Normalize params
  const absolutePath = makeAbsolute(templatePath)
  engine = engine.toLowerCase()

  // Read the template file
  let file = ''
  try {
    file = fs.readFileSync(absolutePath, 'utf8')
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error('Missing template file: ' + templatePath)
    } else {
      console.error(e)
      throw e
    }
  }

  // Compile the template using selected engine.
  let templateFn = null
  if (engine === 'ejs') {
    const options = {}
    templateFn = ejs.compile(file, options)
  } else {
    throw new Error('Template engine is not supported: ' + engine)
  }

  // Return the compiled function.
  return templateFn
}
