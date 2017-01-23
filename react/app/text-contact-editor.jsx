import React, {Component} from 'react'
import BrowseFile from './browse-file.jsx'
import {filterSkypeUsernames} from '../util/index.jsx'
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

  load(file) {
    this.setState({busy: true})
    const reader = new FileReader()
    reader.onload = e => {
      this.setState({busy: false})
      this.props.setText(e.target.result)
    }
    reader.readAsText(file)
  }

  render() {
    return <Segment className="widget text-contact-editor">
      <Form>
        <h2>Добавьте контакты</h2>
        <BrowseFile setText={this.setText}/>
        <small>или</small>
        <TextArea
          className="contacts"
          onChange={this.onChange}
          value={this.state.text}
          name="text"
          label="Вставьте контакты"
          placeholder="Вставьте список из 40-ка Skype-контактов для добавления в друзья"
        />
        <Button
          type="submit"
          disabled={!this.state.text}
          onClick={this.load}
          loading={this.state.busy}
          content="Добавить в очередь"
          icon="group"/>
      </Form>
    </Segment>
  }
}