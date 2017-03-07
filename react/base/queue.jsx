import Contact from '../entity/contact.jsx'
import Skype from '../skype/index.jsx'
import Timeout from '../util/timeout.jsx'
import {extend, merge} from 'lodash'
import {Status} from '../../app/config'
import React from 'react'

function Queue(options) {
  extend(this, options)
}

extend(Queue, {
  query(account, type) {
    return db.contact.where({
      account,
      authorized: 0,
      status: Status.CREATED
    })
      .filter(c => type === c.type)
  },

  create(component, options) {
    const query = () => Queue.query(component.props.account, component.props.type)
    return new Queue(merge({
      inform: component.props.alert,
      account: component.props.account,
      query
    }, options))
  }
})

Queue.prototype = {
  __proto__: Timeout,

  openSkype() {
    return Skype.open(this.account, true)
  },

  async execute() {
    this.timeoutDuration = skypeTimeout
    const count = await this.query()
      .count()

    if (count > 0) {
      this.inform('busy', 'Входа в скайп')
      const skype = await this.openSkype()
      this.inform('busy', 'Получение списка контактов')
      this.setTimeout(() => {
        const seconds = Math.round(this.timeoutDuration / 1000)
        this.inform('error', `Skype не отвечает в течении ${seconds} секунд`)
        if (skype.remove instanceof Function) {
          skype.remove()
        }
      })
      if (skype.openSettings instanceof Function) {
        skype.openSettings()
      }
      if (this.beforeIteration instanceof Function) {
        this.beforeIteration(skype)
      }

      const inform = i => this.inform('busy', this.success(i, count))

      let i = 0
      const pull = async() => {
        const contact = await this.query().first()
        if (!contact) {
          return
        }
        await this.work(skype, contact)
        inform(++i)
        this.updateTimeout()
        if (i < count) {
          await pull()
        }
      }

      inform(0)
      await pull()
      this.clearTimeout()
      Contact.emit('update')
    }
    else {
      this.inform('error', 'Не найдено ни одного котакта')
    }
  }
}

export default Queue
