import React, {Component, PropTypes} from 'react'
import {Button, TextArea} from 'semantic-ui-react'
import Persistence from '../util/persistence.jsx'

export default class Editor extends Component {
  persist = ['value']

  static propTypes = {
    disabled: PropTypes.bool,
    submit: PropTypes.func
  }

  componentWillMount() {
    this.setState(Persistence.register(this, {
      value: '',
      busy: false
    }))
  }

  onChange = (e, {name, value}) => {
    this.setState({[name]: value})
  }

  textarea(props) {
    return <TextArea
      name="value"
      value={this.state.value}
      onChange={this.onChange}
      {...props}/>
  }

  submitButton(props) {
    return <Button
      type="submit"
      disabled={this.props.disabled && !this.state.value}
      loading={this.state.busy}
      {...props}/>
  }

  onSubmit = (e, {formData: {value}}) => {
    e.preventDefault()
    if (this.submit instanceof Function) {
      this.submit(value)
    }
    else if (this.props.submit instanceof Function) {
      this.props.submit(value)
    }
    else {
      console.error('Cannot submit')
    }
  }
}
