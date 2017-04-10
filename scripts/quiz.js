const cheerio = require('cheerio')
const fs = require('fs')

const q = cheerio.load(fs.readFileSync('/Users/kissarat/Downloads/Quest127.xml'))
const qa = cheerio.load(fs.readFileSync('/Users/kissarat/Downloads/Answer127.xml'))
const questions = []

function short(string) {
  const acronyms = string.split(/\s+/g)
    .filter(a => /^[\wа-яіґїъ"]/i.test(a))
    .map(a => '"' === a[0] ? a[1] : a[0])
  return acronyms.join('').slice(0, 10)
}

const answers = {}
qa('ROW').each(function (i, {attribs: {kodquestion, answer, vesanswer}}) {
  const a = answers[kodquestion] || []
  if (vesanswer > 0) {
    a.push(short(answer))
  }
  answers[kodquestion] = a
})

q('ROW').each(function (i, {attribs: {kodquestion, question}}) {
  question = short(question)
  const answer = answers[kodquestion]
  if (answer) {
    question += ' - ' + answer.join(' ')
  }
  questions.push(question)
})

console.log(questions.sort().join('\n'))
