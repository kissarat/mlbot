const lines = []
for(let i = 0; i < 50 * 1000; i++) {
  lines.push(i.toString())
}
const string = new Array(24).join('a')
console.log(lines.join('\n' + string))
