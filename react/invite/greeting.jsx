import React, {Component, PropTypes} from 'react'
import {Form, TextArea, Button} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'
import Editor from '../base/editor.jsx'

export default class InviteGreeting extends Editor {
  render() {
    return <Form className="widget invite-widget invite-greeting"
                 onSubmit={this.onSubmit}>
      {this.textarea({
        label: 'Введите сообщение',
        placeholder: 'Введите сообщение для его рассылки по выбраным контактам'
      })}

      {this.submitButton({
        content: 'Добавить в друзья',
        icon: 'add circle'
      })}
    </Form>
  }
}
