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

export function substituteVisual(text) {
  return text
      .split('')
      .map(c => s[c] && Math.random() > 0.5 ? s[c] : c)
      .join('')
}

export function specialSymbols(text) {
  return text
      .replace(/(\.\.\.|…)/g, s => Math.random() > 1 / 3 ? '…' : '...')
      .replace(/[.,!?] /g, s => Math.random() > 2 / 3 ? s + ' ' : s)
      .replace(/ - /g, s => Math.random() > 1 / 3 ? ' - ' : ' — ')
}

export function randomization(text) {
  return text.replace(/\[[\wа-яіїґё\s\|]+]/ig, s => _.sample(s.slice(1, -1).split('|')))
}

export function evaluation(text, vars) {
  return text.replace(/\{[^}]+}/g, function (s) {
    s = s.slice(1, -1)
    if (!_.isEmpty(vars)) {
      s = s.replace(/[a-z_]+/g, function (name) {
        return name in vars ? JSON.stringify(vars[name]) :  ''
      })
    }
    return eval(s)
  })
}

export function skypeMarkup(text) {
  return text.replace(/\*[^*]+\*/, s => '<b raw_pre="*" raw_post="*">' + s.slice(1, -1) + '</b>')
}

export function substitute(text, vars) {
  return skypeMarkup(substituteVisual(specialSymbols(randomization(evaluation(text, vars)))))
}

export function latinFinding(text) {
  return text
      .split('')
      .map(c => c.charCodeAt(0) < 128 ? c : ' ')
      .join('')
}
