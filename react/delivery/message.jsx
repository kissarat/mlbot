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
    if (this.state.sign && signature) {
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
      <Form.Checkbox
      label="добавить подпись"
      name="signature"
      checked={this.state.sign}
      onChange={e => this.setState({sign: e.target.checked})}/>
      <Form.TextArea
        label= "Подпись"
        name="signature"
        disabled={!this.state.sign}
        value={this.state.signature}
        onChange={this.onChange}/>

      {this.submitButton({
        content: 'Разослать',
        icon: 'send'
      })}
    </Form>
  }
}
