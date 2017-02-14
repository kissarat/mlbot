import React, {Component, PropTypes} from 'react'
import {Form} from 'semantic-ui-react'
import {toArray, defaults, keyBy, uniq, isObject} from 'lodash'
import Editor from '../base/editor.jsx'
import api from '../connect/api.jsx'
import Help from '../widget/help.jsx'

export default class Message extends Editor {
  name = 'Message'
  persist = ['value', 'signature', 'sign']

  state = {
    sign: true,
    signature: 'https://club-leader.com/'
  }

  static propTypes = {
    submit: PropTypes.func
  }

  componentWillMount() {
    this.setState({
      signature: 'Сообщение отправлено с помощью программы: https://club-leader.com/?&r='
      + api.config.user.nick
    })
  }

  submit(value) {
    if (this.state.sign) {
      value += '\n▁▁▁▁▁▁▁▁▁▁▁▁▁\n' + this.state.signature
    }
    this.props.submit(value)
  }

  onCheckboxChange = (e, {name, checked}) => {
    this.setState({[name]: checked})
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

      {this.submitButton({
        content: 'Разослать',
        icon: 'send'
      })}
    </Form>
  }
}
