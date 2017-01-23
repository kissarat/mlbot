import React, {Component, PropTypes} from 'react'
import {Form, TextArea, Button} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'

export default class InviteGreeting extends Component {
  static propTypes = {
    invite: PropTypes.func
  }

  onSubmit = (e, {formData: {text}}) => {
    e.preventDefault()
    this.props.invite(text)
  }

  render() {
    return <Form className="widget invite-widget invite-greeting"
                 onSubmit={this.onSubmit}>
        <TextArea
          name="greeting"
          className="greeting"
          label="Сообщение-приветствие"
          placeholder="Введите текст, который получит каждый контакт при добавлении в друзья"
        />
      <Button
        type="submit"
        content="Добавить в друзья"
        icon="add circle"
      />
    </Form>
  }
}
