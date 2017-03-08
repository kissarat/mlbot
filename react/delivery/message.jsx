import api from '../connect/api.jsx'
import Editor from '../base/editor.jsx'
import Help from '../widget/help.jsx'
import React, {Component, PropTypes} from 'react'
import {Form} from 'semantic-ui-react'
import {range, toArray, map, defaults, keyBy, uniq, isObject} from 'lodash'
import moment from 'moment'

function toOptions(array) {
  return map(array, function (value) {
    return {value, key: value, text: ('0' + value).slice(-2)}
  })
}

const hours = toOptions(range(0, 24))
const minutes = toOptions(range(0, 60))

export default class Message extends Editor {
  name = 'Message'
  persist = ['value', 'signature', 'sign']

  state = {
    sign: true,
    // signature: 'https://club-leader.com/'
  }

  static propTypes = {
    submit: PropTypes.func
  }

  componentWillMount() {
    const now = new Date()
    this.setup({
      signature: 'Сообщение отправлено с помощью программы: https://club-leader.com/?r='
      + api.config.user.nick,
      hour: (1 + now.getHours()) % 24,
      minute: (5 + now.getMinutes()) % 60,
      schedule: false
    })
  }

  submit(value) {
    if (this.state.sign) {
      value += '\n▁▁▁▁▁▁▁▁▁▁▁▁▁\n' + this.state.signature
    }

    if (this.state.timer) {
      this.clearTimer()
    }
    else if (this.state.schedule) {
      const time = this.getScheduleTime()
      console.log('SCHEDULE', time.toLocaleString())
      this.setState({
        timer: setTimeout(() => this.clearTimer() && this.props.submit(value), time.getTime() - Date.now()),
        interval: setInterval(() => this.setState({left: Date.now()}), 980)
      })
    }
    else {
      this.props.submit(value)
    }
  }

  clearTimer() {
    clearTimeout(this.state.timer)
    clearInterval(this.state.interval)
    this.setState({timer: null})
    return true
  }

  getScheduleTime() {
    const now = new Date()
    const time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +this.state.hour, +this.state.minute)
    if (time.getTime() < now.getTime()) {
      time.setTime(time.getTime() + 24 * 3600 * 1000)
    }
    return time
  }

  onCheckboxChange = (e, {name, checked}) => {
    this.setState({[name]: checked})
  }

  hourPostfix() {
    const hour = this.state.hour
    if (1 == hour || 21 == hour) {
      return 'час'
    }
    if (hour > 1 && hour < 5 || hour > 21) {
      return 'часа'
    }
    return 'часов'
  }

  minutePostfix() {
    const minute = this.state.minute
    if (1 == minute) {
      return 'минута'
    }
    if (minute > 1 && minute < 5) {
      return 'минуты'
    }
    return 'минут'
  }

  select(name, options) {
    options = map(options, o => <option key={o.key} value={o.value}>{o.text}</option>)
    return <select
      name={name}
      disabled={!this.state.schedule}
      style={{opacity: this.state.schedule ? 1 : 0.3}}
      onChange={this.onChange}
      value={this.state[name]}>
      {options}
    </select>
  }

  scheduleButton() {
    let content
    let icon = 'time'
    if (this.state.timer) {
      content = 'Отменить'
    }
    else if (this.state.schedule) {
      content = 'Запланировать'
    }
    else {
      content = 'Разослать'
      icon = 'send'
    }
    return this.submitButton({content, icon})
  }

  scheduleGroup() {
    if (this.state.timer) {
      const time = moment(this.getScheduleTime())
      let d = moment.duration(time.diff(moment()))
      d = [d.hours(), d.minutes(), d.seconds()].map(v => ('0' + v).slice(-2)).join(':')
      return <div className="duration">
        <span>Осталось </span>
        <strong className="value">{d}</strong>
        <span> до запуска рассылки</span>
      </div>
    }
    else {
      return <div className="group time">
        <Form.Checkbox
          name="schedule"
          label="Запустить в "
          checked={this.state.schedule}
          onChange={this.onCheckboxChange}
        />
        {this.select('hour', hours)}
        <span>{this.hourPostfix()}</span>
        {this.select('minute', minutes)}
        <span>{this.minutePostfix()}</span>
      </div>
    }
  }

  render() {
    return <Form className="widget delivery-message"
                 onSubmit={this.onSubmit}>
      {this.textarea({
        label: 'Введите сообщение',
        placeholder: 'Введите сообщение для его рассылки по выбраным контактам'
      })}
      <Help text={this.state.signature}>
        <Form.Checkbox
          label="добавить подпись"
          name="sign"
          checked={this.state.sign}
          onChange={this.onCheckboxChange}/>
      </Help>
      <div className="container">{this.props.children}</div>

      {this.scheduleGroup()}
      {this.scheduleButton()}
    </Form>
  }
}
