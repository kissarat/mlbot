Object.defineProperty(window, 'skypeTimeout', {
  get() {
    console.error('Using global skypeTimeout variable')
    return 180 * 1000
  }
})

import api from '../../connect/api.jsx'
import Footer from '../widget/footer.jsx'
import React, {Component, isValidElement} from 'react'
import SingletonComponent from '../base/singleton-component.jsx'
import {each, defaults, isObject} from 'lodash'
import {hashHistory} from 'react-router'
import {Segment, Dimmer, Loader} from 'semantic-ui-react'
import AppMenu from './menu.jsx'

export default class App extends SingletonComponent {
  state = {
    busy: false
  }

  static setBusy(busy) {
    this.set({busy})
  }

  componentDidMount() {
    setTimeout(function () {
        if (!(isObject(api.config.user) && 'string' === typeof api.config.user.nick)) {
          location.reload()
        }
      }
      , 500)
  }

  dimmer() {
    if ('string' === typeof this.state.busy) {
      return <Loader
        size="medium"
        content={this.state.busy}/>
    }
    else if (isValidElement(this.state.busy)) {
      return this.state.busy
    }
  }

  render() {
    return <div className="layout app">
      <Dimmer active={!!this.state.busy} inverted>
        {this.dimmer()}
      </Dimmer>
      <AppMenu/>
      <Segment className="content">{this.props.children}</Segment>
      <Footer/>
    </div>
  }
}
