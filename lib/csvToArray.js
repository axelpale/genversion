module.exports = (csv) => {
  if (!csv || typeof csv !== 'string') {
    return []
  }

  return csv.split(',')
}
