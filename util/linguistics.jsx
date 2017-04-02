import _ from 'lodash'

const s = {
  а: 'a',
  е: 'e',
  о: 'o',
  р: 'p',
  с: 'с',
  у: 'y',
  х: 'x',
  А: 'A',
  К: 'K',
  Н: 'H',
  О: 'O',
  Р: 'P',
  С: 'C',
  Т: 'T',
  Х: 'X'
}

function graphicalSubstitution(text) {
  return text
      .split('')
      .map(c => s[c] && Math.random() > 0.5 ? s[c] : c)
      .join('')
}

function specialSymbols(text) {
  return text
      .replace(/(\.\.\.|…)/g, s => Math.random() > 1 / 3 ? '…' : '...')
      .replace(/[.,!?] /g, s => Math.random() > 2 / 3 ? s + ' ' : s)
      .replace(/ - /g, s => Math.random() > 1 / 3 ? ' - ' : ' — ')
}

function randomization(text) {
  return text.replace(/\[[\wа-яіїґё\s\|]+]/ig, s => _.sample(s.slice(1, -1).split('|')))
}

function latinFinding(text) {
  return text
      .split('')
      .map(c => c.charCodeAt(0) < 128 ? c : ' ')
      .join('')
}
