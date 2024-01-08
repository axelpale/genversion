// These reserved words should be quoted if used as an object key.
// For example, the dependencies object in package.json can list package names
// that match one of the following words.
module.exports = [
  // ECMAScript 3
  'int',
  'byte',
  'char',
  'goto',
  'long',
  'final',
  'float',
  'short',
  'double',
  'native',
  'throws',
  'boolean',
  'abstract',
  'volatile',
  'transient',
  'synchronized',
  // ECMAScript 5
  'break',
  'case',
  'catch',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'finally',
  'for',
  'function',
  'if',
  'in',
  'instanceof',
  'new',
  'return',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  // ECMAScript 6
  'class',
  'const',
  'enum',
  'export',
  'extends',
  'import',
  'super',
  'implements',
  'interface',
  'let',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'yield',
  // Literals
  'null',
  'true',
  'false',
  'NaN',
  'Infinity',
  'undefined',
  // Other
  'eval',
  'arguments'
]