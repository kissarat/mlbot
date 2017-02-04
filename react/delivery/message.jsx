import React, {Component, PropTypes} from 'react'
import {Form} from 'semantic-ui-react'
import {toArray, defaults, keyBy, uniq} from 'lodash'
import Editor from '../base/editor.jsx'

export default class Message extends Editor {
  persist = ['value', 'signature']

  static propTypes = {
    submit: PropTypes.func
  }

  submit(value, {signature}) {
    if (signature) {
      value += '\n' + signature
    }
    this.props.submit(value)
  }

  render() {
    return <Form className="widget delivery-message"
      onSubmit={this.onSubmit}>
      {this.textarea({
        label: 'Введите сообщение',
        placeholder: 'Введите сообщение для его рассылки по выбраным контактам'
      })}
      <Form.TextArea
        label= "Подпись"
        name="signature"
        value={this.state.signature}
        onChange={this.onChange}/>

      {this.submitButton({
        content: 'Разослать',
        icon: 'send'
      })}
    </Form>
  }
}
