const SIGNATURE = require('./config').SIGNATURE
const stringify = require('./stringify')

module.exports = (data) => {
  // This is the default template function for the generated module.
  //
  // Parameters:
  //   data
  //     an object with properties:
  //       pkg
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
  //           useEsmSyntax
  //             a boolean. True to use ECMAScript module syntax.
  //           useStrict
  //             a boolean. Add the 'use strict' header
  //
  // Return:
  //   a string. The version module contents.
  //
  const intro = SIGNATURE + '\n'
  const pkg = data.pkg
  const opts = data.options

  let Q = opts.useDoubleQuotes ? '"' : '\''
  Q = opts.useBackticks ? '`' : Q

  const SEMI = opts.useSemicolon ? ';' : ''

  const keys = Object.keys(pkg)

  let exporter
  if (opts.useEsmSyntax) {
    exporter = 'export const '
  } else if (keys.length > 1) {
    exporter = 'exports.'
  } else {
    // Single property
    exporter = 'module.exports'
  }

  // Options for stringify
  const strOpts = {
    quote: Q
  }

  // Begin content build
  let content = intro

  // In some cases 'use strict' is required in the file
  // Can have comments before, but must be first statement
  if (opts.useStrict) {
    content += Q + 'use strict' + Q + SEMI + '\n\n'
  }

  if (keys.length === 1 && !opts.useEsmSyntax) {
    const prop = pkg[keys[0]]
    content += exporter + ' = ' + stringify(prop, strOpts) + SEMI + '\n'
  } else {
    keys.forEach(key => {
      const prop = pkg[key]
      content += exporter + key + ' = ' + stringify(prop, strOpts) + SEMI + '\n'
    })
  }

  return content
}
