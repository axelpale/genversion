const SIGNATURE = require('./config').SIGNATURE

module.exports = (data) => {
  // This is the default template for the generated module.
  //
  // Parameters:
  //   data
  //     an object with properties:
  //       package
  //         an object. A stripped down subset of package.json properties.
  //       options
  //         optional object with optional properties:
  //           useSemicolon
  //             a boolean. True to use semicolons in generated code
  //           useDoubleQuotes
  //             a boolean. Set true to use double quotes in generated code
  //             instead of single quotes.
  //           useBackticks
  //             a boolean. Set true to use backticks in generated code
  //             .. instead of single or double quotes.
  //           useEs6Syntax
  //             a boolean. True to use ES6 export syntax in generated code
  //           useStrict
  //             a boolean. Add the 'use strict' header
  //
  // Return:
  //   a string. The version module contents.
  //
  const intro = SIGNATURE + '\n'
  const meta = data.package
  const opts = data.options

  let Q = opts.useDoubleQuotes ? '"' : '\''
  Q = opts.useBackticks ? '`' : Q

  const SEMI = opts.useSemicolon ? ';' : ''

  const keys = Object.keys(meta)

  let exporter
  if (opts.useEs6Syntax) {
    exporter = 'export const '
  } else if (keys.length > 1) {
    exporter = 'exports.'
  } else {
    // Single property
    exporter = 'module.exports'
  }

  // Begin content build
  let content = intro

  // In some cases 'use strict' is required in the file
  // Can have comments before, but must be first statement
  if (opts.useStrict) {
    content += Q + 'use strict' + Q + SEMI + '\n\n'
  }

  if (keys.length === 1 && !opts.useEs6Syntax) {
    const prop = meta[keys[0]]
    content += exporter + ' = ' + Q + prop + Q + SEMI + '\n'
  } else {
    keys.forEach(key => {
      const prop = meta[key]
      content += exporter + key + ' = ' + Q + prop + Q + SEMI + '\n'
    })
  }

  return content
}
