import React, {Component} from 'react'
import os from 'os'
import {pick, values} from 'lodash'

export default class Indicator extends Component {
  state = {
    workingSetSize: 0
  }

  updateInfo = () => {
    const state = {
      memory: Math.ceil(process.getProcessMemoryInfo().workingSetSize / 1024),
      free: Math.ceil(process.getSystemMemoryInfo().free / 1024),
      cpu: Math.ceil(os.loadavg()[0] * 100 / os.cpus().length)
      // free: Math.ceil(os.freemem() / (1024 * 1024))
    }
    // let load = 0
    // const cpus = os.cpus()
    // for (const cpu of cpus) {
    //   const t = cpu.times
    //   const useful = t.user + t.sys
    //   load += useful / (useful + t.idle + t.irq + t.nice)
    // }
    // state.cpu = Math.ceil(100 * load / cpus.length)
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

    let cpu = ''
    if (this.state.cpu > 95) {
      cpu = 'danger'
    }
    else if (this.state.cpu >= 85) {
      cpu = 'warning'
    }

    return <div className="widget indicator">
      <div className="memory used" title="Используемая программой память">{this.state.memory}</div>
      <div className={'memory free ' + free} title="Свободной памяти">{this.state.free}</div>
      <div className={'cpu ' + cpu} title="Загрузка процессора">{this.state.cpu}</div>
    </div>
  }
}
