import api from '../../connect/api.jsx'
import config from '../../app/config'
import Editor from '../base/editor.jsx'
import Help from '../widget/help.jsx'
import PropTypes from 'prop-types'
import React, {Componen} from 'react'
import Task from '../../account-manager/task.jsx'
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
    sign: false,
    signature: '',
    wait: 10,
  }

  static propTypes = {
    submit: PropTypes.func
  }

  componentWillMount() {
    const now = new Date()
    let signature = ''
    if ('club-leader' === config.vendor) {
      signature = 'Сообщение отправлено с помощью программы: https://club-leader.com/?r=' + api.config.user.nick
    }
    this.setup({
      signature,
      hour: (1 + now.getHours()) % 24,
      minute: (5 + now.getMinutes()) % 60,
      schedule: false,
      sign: false
    })
  }

  submit(value, state) {
    if ('club-leader' === config.vendor && this.state.sign) {
      value += '\n▁▁▁▁▁▁▁▁▁▁▁▁▁\n' + this.state.signature
    }

    let task
    if (state.schedule) {
      task = new Task.Delivery({
        ...state,
        after: this.getScheduleTime().getTime()
      })
    }
    else {
      task = new Task.Delivery(state)
    }
    task.text = value

    this.props.submit(task)
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
      {true || config.Type.CHAT === this.props.type ? <div className="group">
          с задежкой
          <input
            name="wait"
            value={this.state.wait}
            onChange={this.onChange}/>
          секунд между рассылками
        </div> : ''}
    </div>
  }

  scheduleButton() {
    const [content, icon] = this.state.schedule
      ? ['Запланировать', 'time']
      : ['Разослать', 'send']
    return this.submitButton({content, icon})
  }

  signature() {
    if ('club-leader' === config.vendor) {
      return <Help text={this.state.signature}>
        <Form.Checkbox
          label="добавить подпись"
          name="sign"
          checked={this.state.sign}
          onChange={this.onCheckboxChange}/>
      </Help>
    }
  }

  render() {
    return <Form
      className="widget delivery-message"
      onSubmit={this.onSubmit}>
      {this.textarea({
        label: 'Введите сообщение',
        placeholder: 'Введите сообщение для его рассылки по выбраным контактам'
      })}
      {this.signature()}
      <div className="container">{this.props.children}</div>

      {this.scheduleGroup()}
      {this.scheduleButton()}
    </Form>
  }
}
