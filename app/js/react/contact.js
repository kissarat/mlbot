const sqlite = require('../sqlite')
const React = require('react')

window.sqlite = sqlite

const ContactList = React.createClass({
  componentWillMount() {
    this.setState({contacts: []})
    sqlite.table('contact')
      .orderBy('login')
      .then(contacts => {
        console.log(contacts)
        this.setState({contacts})
      })
      .catch(function (err) {
        console.error(err)
      })
  },

  render() {
    return React.createElement('ul', {}, this.state.contacts.map(contact =>
      React.createElement('li', {}, contact.id)
    ))
  }
})

module.exports = ContactList
