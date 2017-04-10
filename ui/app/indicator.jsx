import React, {Component} from 'react'
import os from 'os'
import {pick, range} from 'lodash'

export default class Indicator extends Component {
  state = {
    workingSetSize: 0,
    cpu: 0
  }

  updateInfo = async() => {
    const state = {
      memory: process.getProcessMemoryInfo().workingSetSize / 1024,
      free: Math.ceil(process.getSystemMemoryInfo().free / 1024),
      // cpu: Math.ceil(os.loadavg()[0] * 100 / os.cpus().length)
      // free: Math.ceil(os.freemem() / (1024 * 1024))
    }
    const webviews = document.querySelectorAll('webview')
    for (let i = 0; i < webviews.length; i++) {
      const {memory} = await webviews[i].getPerformance()
      state.memory += memory.usedJSHeapSize / (1024 * 1024)
    }
    state.memory = Math.ceil(state.memory)
    this.setState(state)
  }

  componentWillMount() {
    this.updateInfo()
    this.timer = setInterval(this.updateInfo, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {
    let free = ''
    if (this.state.free < 100) {
      free = 'danger'
    }
    else if (this.state.free < 300) {
      free = 'warning'
    }

    return <div className="widget indicator">
      <div className="memory used" title="Используемая программой память">{this.state.memory}</div>
      <div className={'memory free ' + free} title="Свободной памяти">{this.state.free}</div>
    </div>
  }
}
