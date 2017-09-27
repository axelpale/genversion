/* eslint no-magic-numbers: "off" */

module.exports = {
  'root': true,
  'env': {
    // Node.js global variables and Node.js scoping
    'node': true,
  },
  'globals': {
    // place settings for globals here
    '$': true,
  },
  'parserOptions': {
    'ecmaVersion': 6,
  },

  // For available rules, see http://eslint.org/docs/rules/
  'extends': 'eslint:recommended',
  'rules': {

    //// POSSIBLE SYNTAX ERRORS

    // disallow the use of console
    'no-console': 'off',

    //// BEST PRACTICES

    // enforce return statements in callbacks of array methods
    'array-callback-return': 'error',
    // enforce the use of variables within the scope they are defined
    'block-scoped-var': 'error',
    // enforce consistent brace style for all control statements
    'curly': ['error', 'all' ],
    // require default cases in switch statements
    'default-case': 'error',
    // enforce consistent newlines before and after dots
    'dot-location': ['error', 'property' ],
    // enforce dot notation whenever possible
    'dot-notation': 'error',
    // require the use of === and !==
    'eqeqeq': 'error',
    // require for-in loops to include an if statement
    'guard-for-in': 'error',
    // disallow the use of alert, confirm, and prompt
    'no-alert': 'error',
    // disallow the use of arguments.caller or arguments.callee
    'no-caller': 'error',
    // disallow division operators explicitly at the beginning of
    // regular expressions
    'no-div-regex': 'error',
    // disallow else blocks after return statements in if statements
    'no-else-return': 'error',
    // disallow empty functions
    'no-empty-function': 'off',
    // disallow null comparisons without type-checking operators
    'no-eq-null': 'error',
    // disallow unnecessary labels
    'no-extra-label': 'error',
    // disallow leading or trailing decimal points in numeric literals
    'no-floating-decimal': 'error',
    // disallow assignments to native objects or read-only global variables
    'no-global-assign': 'error',
    // disallow shorthand type conversions
    'no-implicit-coercion': 'error',
    // disallow this keywords outside of classes or class-like objects
    'no-invalid-this': 'error',
    // disallow labeled statements
    'no-labels': 'error',
    // disallow unnecessary nested blocks
    'no-lone-blocks': 'off',
    // disallow function declarations and expressions inside loop statements
    'no-loop-func': 'error',
    // disallow magic numbers
    'no-magic-numbers': ['error', { ignore: [-1, 0, 1, 2] }],
    // disallow multiple spaces
    'no-multi-spaces': ['error', { ignoreEOLComments: true }],
    // disallow multiline strings
    'no-multi-str': 'error',
    // disallow new operators with the Function object
    'no-new-func': 'error',
    // disallow new operators with the String, Number, and Boolean objects
    'no-new-wrappers': 'error',
    // disallow new operators outside of assignments or comparisons
    'no-new': 'error',
    // disallow octal escape sequences in string literals
    'no-octal-escape': 'error',
    // disallow reassigning function parameters
    'no-param-reassign': 'off',
    // disallow the use of the __proto__ property
    'no-proto': 'error',
    // disallow assignment operators in return statements
    'no-return-assign': 'error',
    // disallow comparisons where both sides are exactly the same
    'no-self-compare': 'error',
    // disallow comma operators
    'no-sequences': 'error',
    // disallow throwing literals as exceptions
    'no-throw-literal': 'error',
    // disallow unmodified loop conditions
    'no-unmodified-loop-condition': 'error',
    // disallow unused expressions
    'no-unused-expressions': 'error',
    // disallow unnecessary calls to .call() and .apply()
    'no-useless-call': 'error',
    // disallow unnecessary concatenation of literals or template literals
    'no-useless-concat': 'error',
    // disallow unnecessary escape characters
    'no-useless-escape': 'error',
    // disallow void operators
    'no-void': 'error',
    // disallow with statements
    'no-with': 'error',
    // enforce the consistent use of the radix argument when using parseInt()
    'radix': 'error',
    // require var declarations be placed at the top of their containing scope
    'vars-on-top': 'off',
    // require parentheses around immediate function invocations
    'wrap-iife': 'error',
    // require or disallow “Yoda” conditions
    'yoda': 'error',

    //// VARIABLES

    // disallow variable declarations from shadowing variables declared
    // in the outer scope
    'no-shadow': 'error',
    // disallow initializing variables to undefined
    'no-undef-init': 'error',
    // disallow the use of undefined as an identifier
    'no-undefined': 'error',
    // disallow the use of variables before they are defined
    'no-use-before-define': 'error',

    //// Node.js and Common.js

    // require return statements after callbacks
    'callback-return': 'error',
    // require require() calls to be placed at top-level module scope
    'global-require': 'error',
    // require error handling in callbacks
    'handle-callback-err': 'error',
    // disallow new operators with calls to require
    'no-new-require': 'error',
    // disallow string concatenation with __dirname and __filename
    'no-path-concat': 'error',
    // disallow the use of process.env
    'no-process-env': 'error',
    // disallow synchronous methods
    'no-sync': 'error',

    //// STYLISTIC ISSUES

    // enforce consistent spacing inside single-line blocks
    'block-spacing': 'error',
    // enforce consistent brace style for blocks
    'brace-style': 'error',
    // enforce camelcase naming convention
    'camelcase': 'error',
    // require or disallow trailing commas
    'comma-dangle': [ 'error', 'always-multiline' ],
    // enforce consistent spacing before and after commas
    'comma-spacing': 'error',
    // enforce consistent comma style
    'comma-style': 'error',
    // enforce consistent naming when capturing the current execution context
    'consistent-this': [ 'error', 'self' ],
    // require or disallow newline at the end of files
    'eol-last': 'error',
    // require or disallow spacing between function identifiers and
    // their invocations
    'func-call-spacing': 'error',
    // require or disallow named function expressions
    'func-names': 'off',
    // enforce the consistent use of either function declarations or
    // expressions
    'func-style': 'error',
    // enforce consistent indentation
    'indent': ['error', 2, {
      'CallExpression': {
        'arguments': 'first',
      },
      'FunctionExpression': {
        'parameters': 'first',
      },
      'VariableDeclarator': {
        'var': 2,
        'let': 2,
        'const': 3,
      },
      'SwitchCase': 1,
    }],
    // enforce consistent spacing between keys and values in object
    // literal properties
    'key-spacing': 'error',
    // enforce consistent spacing before and after keywords
    'keyword-spacing': 'error',
    // enforce consistent linebreak style
    'linebreak-style': 'error',
    // enforce a maximum depth that blocks can be nested
    'max-depth': 'error',
    // enforce a maximum line length
    'max-len': ['error', { code: 80 } ],
    // enforce a maximum number of lines per file
    'max-lines': ['error', { max: 300 } ],
    // enforce a maximum depth that callbacks can be nested
    'max-nested-callbacks': 'error',
    // enforce a maximum number of parameters in function definitions
    'max-params': ['error', { max: 4 } ],
    // enforce a maximum number of statements allowed per line
    'max-statements-per-line': 'error',
    // enforce a maximum number of statements allowed in function blocks
    'max-statements': ['error', 20 ],
    // require constructor names to begin with a capital letter
    'new-cap': ['error', { capIsNewExceptions: ['Emitter' ] } ],
    // require parentheses when invoking a constructor with no arguments
    'new-parens': 'error',
    // require or disallow an empty line after variable declarations
    'newline-after-var': 'off',
    // require an empty line before return statements
    'newline-before-return': 'off',
    // require a newline after each call in a method chain
    'newline-per-chained-call': ['error', { 'ignoreChainWithDepth': 3 } ],
    // disallow Array constructors
    'no-array-constructor': 'error',
    // disallow bitwise operators
    'no-bitwise': 'error',
    // disallow continue statements
    'no-continue': 'error',
    // disallow if statements as the only statement in else blocks
    'no-lonely-if': 'error',
    // disallow mixed binary operators
    'no-mixed-operators': 'error',
    // disallow negated conditions
    'no-negated-condition': 'error',
    // disallow nested ternary expressions
    'no-nested-ternary': 'error',
    // disallow Object constructors
    'no-new-object': 'error',
    // disallow the unary operators ++ and --
    'no-plusplus': 'error',
    // disallow trailing whitespace at the end of lines
    'no-trailing-spaces': 'error',
    // disallow whitespace before properties
    'no-whitespace-before-property': 'error',
    // enforce consistent spacing inside braces
    'object-curly-spacing': ['error', 'always' ],
    // enforce placing object properties on separate lines
    'object-property-newline': 'error',
    // require or disallow newlines around variable declarations
    'one-var-declaration-per-line': 'error',
    // enforce consistent linebreak style for operators
    'operator-linebreak': 'error',
    // enforce the consistent use of either backticks, double, or single quotes
    'quotes': ['error', 'single' ],
    // enforce consistent spacing before and after semicolons
    'semi-spacing': 'error',
    // require or disallow semicolons instead of ASI
    'semi': 'error',
    // enforce consistent spacing before blocks
    'space-before-blocks': 'error',
    // enforce consistent spacing before function definition opening
    // parenthesis
    'space-before-function-paren': [
      'error', {
        'anonymous': 'always',
        'named': 'never',
      },
    ],
    // require spacing around infix operators
    'space-infix-ops': 'error',
    // enforce consistent spacing before or after unary operators
    'space-unary-ops': 'error',
    // require parenthesis around regex literals
    'wrap-regex': 'error',

  },
  'plugins': [
    // you can put plugins here
  ],
};
