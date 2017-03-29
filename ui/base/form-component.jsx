import React, {Component} from 'react'

export default class FormComponent extends Component {
  onChange = e => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  onCheck = (e, {name, checked}) => {
    this.setState({[name]: checked})
  }
}
