/**
 * @param {Global} g
 */
module.exports = function (g) {
  const names = ['home', 'appData', 'userData', 'temp', 'exe', 'module', 'desktop', 'documents', 'downloads', 'music', 'pictures', 'videos', 'pepperFlashSystemPlugin']
  names.forEach(function (name) {
    console.log(name, g.app.getPath(name))
  })
}
