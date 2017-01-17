import React, {Component} from 'react'
import {Message, Icon} from 'semantic-ui-react'

export default class Footer extends Component {
  state = {
    isOpen: false
  }

  render() {
    const className = (this.state.isOpen ? 'collapsed' : 'expanded') + ' widget help'
    const text = this.state.isOpen ? <Message className="help-text" content={this.props.text}/> : ''
    return <div className={className}>
      <div className="help-question">
        <span className="help-content">{this.props.children}</span>
        <Icon name={this.state.isOpen ? 'question circle' : 'question circle outline'}
              size="big"
              onClick={() => this.setState({isOpen: !this.state.isOpen})}/>
      </div>
      {text}
    </div>
  }
}
