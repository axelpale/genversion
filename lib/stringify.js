const reservedWords = require('./reservedWords')

const stringifyKey = (key, options) => {
  // Attempt to quote object key if necessary.
  // Note: does not solve all the cases just the common ones
  // such as a package name that has dash in its name.
  // See https://mathiasbynens.be/notes/javascript-identifiers
  const quote = options.quote
  if (key.indexOf('-') >= 0) {
    return quote + key + quote
  }
  if (reservedWords.indexOf(key) >= 0) {
    return quote + key + quote
  }
  return key
}

const stringifyKeyValue = (key, value, options) => {
  return stringifyKey(key, options) + ': ' + stringify(value, options)
}

const stringify = (value, options) => {
  // Convert value to string that is valid JavaScript.
  // Format and quote depending on the value type.
  //
  const quote = options.quote
  const valueType = typeof value

  if (valueType === 'string') {
    // value is from JSON and thus can have
    // - unescaped double or single quotes '
    if (quote === '\'') {
      // escape unescaped single quote
      const escapedValue = value.replace(/'/g, '\\\'')
      return quote + escapedValue + quote
    } else if (quote === '"') {
      // escape unescaped double quote
      const escapedValue = value.replace(/"/g, '\\"')
      return quote + escapedValue + quote
    } else if (quote === '`') {
      // escape unescaped backtick
      const escapedValue = value.replace(/`/g, '\\`')
      return quote + escapedValue + quote
    }
    // else
    return quote + value + quote
  }

  if (valueType === 'number') {
    return '' + value
  }

  if (valueType === 'boolean') {
    return '' + value
  }

  if (valueType === 'object') {
    if (Array.isArray(value)) {
      return '[' + value.map(v => stringify(v, options)).join(', ') + ']'
    }

    if (value === null) {
      return 'null'
    }

    const keys = Object.keys(value)
    const mapper = k => stringifyKeyValue(k, value[k], options)
    return '{ ' + keys.map(mapper).join(', ') + ' }'
  }

  if (valueType === 'undefined') {
    return 'undefined'
  }

  throw new Error('Unexpected property value type: ' + valueType)
}

module.exports = stringify
