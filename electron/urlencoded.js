module.exports = {
  parse(string, sep = '&', eq = '=') {
    const object = {}
    if (string) {
      string.split(sep).forEach(function (r) {
        r = r.split(eq)
        object[r[0]] = r[1]
      })
    }
    return object
  },

  stringify(object, sep = '&', eq = '=') {
    const strings = []
    for (var key in object) {
      strings.push(key + eq + object[key])
    }
    return strings.join(sep)
  }
}
