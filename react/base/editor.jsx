import React, {Component} from 'react'
import {Button, TextArea} from 'semantic-ui-react'
import Persistence from '../util/persistence.jsx'

export default class Editor extends Component {
  persist = ['text']

  componentWillMount() {
    this.setState(Persistence.register(this, {
      text: '',
      busy: false
    }))
  }

  onChange = (e, {name, value}) => {
    this.setState({[name]: value})
  }

  textarea(props) {
    return <TextArea
      name="text"
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
