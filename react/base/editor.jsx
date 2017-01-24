import React, {Component} from 'react'
import {Button, TextArea} from 'semantic-ui-react'
import Persistent from '../util/persistent.jsx'

export default class Editor extends Component {
  persist = ['text']

  constructor() {
    super()
    Persistent.mix(this)
  }

  onChange = (e, {name, value}) => {
    this.setState({[name]: value})
  }

  state = {
    busy: false,
    text: ''
  }

  textarea(props) {
    return <TextArea
      value={this.state.value}
      onChange={this.onChange}
      {...props}/>

  }

  submitButton(props) {
    return <Button
      type="submit"
      disabled={!this.state.text}
      loading={this.state.busy}
      {...props}/>
  }

  onSubmit = (e, {formData: {text}}) => {
    e.preventDefault()
    if (this.submit instanceof Function) {
      this.submit(text)
    }
    else if (this.props.submit instanceof Function) {
      this.props.submit(text)
    }
    else {
      console.error('Cannot submit')
    }
  }
}
