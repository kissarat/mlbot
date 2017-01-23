import React, {Component} from 'react'
import BrowseFile from './browse-file.jsx'
import {filterSkypeUsernames} from '../util/index.jsx'
import {uniq} from 'lodash'
import {Form, TextArea, Segment, Button, Input, Checkbox, Header} from 'semantic-ui-react'

export default class TextContactEditor extends Component {
  state = {
    busy: false
  }

  setText = string => {
    this.setState({
      text: filterSkypeUsernames(string)
    })
  }

  onSubmit = async(e, {formData: {text}}) => {
    this.setState({busy: true})
    let usernames = filterSkypeUsernames(text)
    if (usernames.length > 0) {

    }
    this.setState({busy: false})
  }

  render() {
    return <Segment className="widget text-contact-editor">
      <Form onSubmit={}>
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