import api from '../../connect/api.jsx'
import config from '../../app/config'
import Editor from '../base/editor.jsx'
import Help from '../widget/help.jsx'
import moment from 'moment'
import React, {Component, PropTypes} from 'react'
import {Form} from 'semantic-ui-react'
import {range, toArray, map, defaults, keyBy, uniq, isObject, pick} from 'lodash'

function toOptions(array) {
  return map(array, function (value) {
    return {value, key: value, text: ('0' + value).slice(-2)}
  })
}

const hours = toOptions(range(0, 24))
const minutes = toOptions(range(0, 60))

export default class Message extends Editor {
  name = 'Message'
  persist = ['value', 'sign']

  state = {
    sign: true,
    signature: 'https://club-leader.com/',
    delay: 10,
  }

  static propTypes = {
    submit: PropTypes.func
  }

  componentWillMount() {
    const now = new Date()
    const refURL = 'club-leader' === config.vendor ? 'https://club-leader.com/?r=' : 'http://inbisoft.com/mlbot/ref/'
    this.setup({
      signature: 'Сообщение отправлено с помощью программы: ' + refURL + api.config.user.nick,
      hour: (1 + now.getHours()) % 24,
      minute: (5 + now.getMinutes()) % 60,
      schedule: false
    })
  }

  submit(value, state) {
    if (this.state.sign) {
      value += '\n▁▁▁▁▁▁▁▁▁▁▁▁▁\n' + this.state.signature
    }

    let task
    if (state.schedule) {
      task = {
        after: this.getScheduleTime().getTime()
      }
    }
    else {
      task = {}
    }
    task.text = value

    this.props.submit({
      ...state,
      text: value
    })
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

  timeOpacity() {
    return {opacity: this.state.schedule ? 1 : 0.3}
  }

  select(name, options) {
    options = map(options, o => <option key={o.key} value={o.value}>{o.text}</option>)
    return <select
      name={name}
      disabled={!this.state.schedule}
      style={this.timeOpacity()}
      onChange={this.onChange}
      value={this.state[name]}>
      {options}
    </select>
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
      return <div>
        <div className="group time">
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
        {config.Type.CHAT === this.props.type ? <div className="group">
            с задежкой
            <input
              name="delay"
              value={this.state.delay}
              onChange={this.onChange}/>
            секунд между рассылками
          </div> : ''}
      </div>
    }
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

  render() {
    return <Form
      className="widget delivery-message"
      onSubmit={this.onSubmit}>
      {this.textarea({
        label: 'Введите сообщение',
        placeholder: 'Введите сообщение для его рассылки по выбраным контактам'
      })}
      <div className="container">{this.props.children}</div>

      {this.scheduleGroup()}
      {this.scheduleButton()}
    </Form>
  }
}
