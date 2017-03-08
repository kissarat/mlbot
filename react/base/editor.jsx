import React, {Component, PropTypes} from 'react'
import {Form} from 'semantic-ui-react'
import Persistence from '../util/persistence.jsx'
import {merge} from 'lodash'

export default class Editor extends Component {
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

  onChange = (e, {name, value}) => {
    this.setState({[name]: value})
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

  onSubmit = (e, {formData}) => {
    e.preventDefault()
    if (this.submit instanceof Function) {
      this.submit(formData.value, formData)
    }
    else if (this.props.submit instanceof Function) {
      this.props.submit(formData.value, formData)
    }
    else {
      console.error('Cannot submit')
    }
  }
}
