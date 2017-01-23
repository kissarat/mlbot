import React, {Component} from 'react'
import BrowseFile from '../app/browse-file.jsx'
import {filterSkypeUsernames} from '../util/index.jsx'
import {uniq} from 'lodash'
import {Form, Segment, Button} from 'semantic-ui-react'
import Contact from '../entity/contact.jsx'

export default class TextContactEditor extends Component {
  state = {
    busy: false
  }

  setText = string => {
    this.setState({
      text: filterSkypeUsernames(string).join('\n')
    })
  }

  onSubmit = async(e, {formData: {text}}) => {
    e.preventDefault()
    this.setState({busy: true})
    let usernames = filterSkypeUsernames(text)
    if (usernames.length > 0) {
      await Contact.pushQueue(usernames)
    }
    this.setState({busy: false})
  }

  render() {
    return <Segment className="widget invite-widget text-contact-editor">
      <Form onSubmit={this.onSubmit}>
        <h2>Добавьте контакты</h2>
        <BrowseFile setText={this.setText}/>
        <small>или</small>
        <Form.TextArea
          className="contacts"
          value={this.state.text}
          name="text"
          label="Вставьте контакты"
          placeholder="Вставьте список из 40-ка Skype-контактов для добавления в друзья"
        />
        <Button
          type="submit"
          disabled={!this.state.text}
          loading={this.state.busy}
          content="Добавить в очередь"
          icon="group"/>
      </Form>
    </Segment>
  }
}