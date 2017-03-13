import FormComponent from '../base/form-component.jsx'
import Persistence from '../../util/persistence.jsx'
import React, {Component, PropTypes} from 'react'
import {Form} from 'semantic-ui-react'
import {merge} from 'lodash'

export default class Editor extends FormComponent {
  static propTypes = {
    disabled: PropTypes.bool,
    submit: PropTypes.func
  }

  componentWillMount() {
    this.setup()
  }

  setup(state) {
    this.setState(Persistence.register(this, merge({
      value: '',
      busy: false
    }, state || this.state)))
  }

  textarea(props) {
    return <Form.TextArea
      name="value"
      autoHeight
      className="editor"
      value={this.state.value}
      onChange={this.onChange}
      {...props}/>
  }

  submitButton(props) {
    return <Form.Button
      type="submit"
      disabled={this.props.disabled && !this.state.value}
      loading={this.state.busy}
      {...props}/>
  }

  onSubmit = e => {
    e.preventDefault()
    const value = this.state.value
    if (this.submit instanceof Function) {
      this.submit(value, this.state)
    }
    else if (this.props.submit instanceof Function) {
      this.props.submit(value, this.state)
    }
    else {
      console.error('Cannot submit')
    }
  }
}
