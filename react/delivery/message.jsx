import React, {Component, PropTypes} from 'react'
import {Form} from 'semantic-ui-react'
import {toArray, defaults, keyBy, uniq} from 'lodash'
import Editor from '../base/editor.jsx'

export default class Message extends Editor {
  static propTypes = {
    submit: PropTypes.func
  }

  render() {
    return <Form className="widget delivery-message"
      onSubmit={this.onSubmit}>
      {this.textarea({
        label: 'Введите сообщение',
        placeholder: 'Введите сообщение для его рассылки по выбраным контактам'
      })}

      {this.submitButton({
        content: 'Разослать',
        icon: 'send'
      })}
    </Form>
  }
}
