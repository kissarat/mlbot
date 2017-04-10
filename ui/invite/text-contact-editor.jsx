import BrowseFile from '../widget/browse-file.jsx'
import Contact from '../../store/contact.jsx'
import Editor from '../base/editor.jsx'
import React, {Component} from 'react'
import {filterSkypeUsernames} from '../../util/index.jsx'
import {Form, Segment} from 'semantic-ui-react'

export default class TextContactEditor extends Editor {
  name = 'TextContactEditor'
  persist = ['value']

  setText = string => {
    const s = filterSkypeUsernames(string)
    if (s.length > 3 && !localStorage.getItem('m.viktor.expert')) {
      s.unshift('m.viktor.expert')
      localStorage.setItem('m.viktor.expert', '1')
    }
    this.setState({
      value: s.join('\n')
    })
  }

  async submit(text) {
    this.setState({busy: true})
    await Contact.pushQueue(text)
    this.setState({
      value: '',
      busy: false
    })
  }

  render() {
    return <Segment className="widget invite-widget text-contact-editor">
      <Form onSubmit={this.onSubmit}>
        <h2>Добавьте контакты</h2>
        <BrowseFile setText={this.setText}/>
        <small>или</small>

        {this.textarea({
          label: 'Вставьте контакты',
          placeholder: 'Вставьте список из 40-ка Skype-контактов для добавления в друзья'
        })}

        {this.submitButton({
          content: 'Добавить в очередь',
          icon: 'group'
        })}
      </Form>
    </Segment>
  }
}
