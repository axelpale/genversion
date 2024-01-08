module.exports = (csv) => {
  if (!csv) {
    return []
  }

  if (Array.isArray(csv)) {
    // Spread comma-separated values and flatten
    const flat = csv.reduce((acc, str) => {
      return acc.concat(str.split(','))
    }, []).map(str => str.trim())

    return flat
  }

  if (typeof csv === 'string') {
    return csv.split(',').map(str => str.trim())
  }

  return []
}
