import React, {Component} from 'react'

/*
 * @property {object} props
 * @property {object} state
 * @property {function} setState
 */
export default class FormComponent extends Component {
  onChange = e => {
    this.setState({[e.target.getAttribute('name')]: e.target.value})
  }

  onCheck = (e, {name, checked}) => {
    this.setState({[name]: checked})
  }

  onSubmit = async e => {
    e.preventDefault()
    this.submit()
  }
}
