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

  async execute() {
    this.timeoutDuration = skypeTimeout
    const openSkype = () => Skype.open(this.account, true)
    const count = await this.query()
      .count()

    if (count > 0) {
      this.inform('busy', 'Подготовка входа в скайп')
      const skype = await openSkype()
      this.inform('busy', 'Получение списка контактов')
      this.setTimeout(() => {
        const seconds = Math.round(this.timeoutDuration / 1000)
        this.inform('error', `Skype не отвечает в течении ${seconds} секунд`)
        skype.remove()
      })
      skype.openSettings()

      const informInvited = i => this.inform('busy', this.success(i, count))

      let i = 0
      const pull = async() => {
        const contact = await this.query().first()
        if (!contact) {
          return
        }
        await this.work(skype, contact)
        informInvited(++i)
        this.updateTimeout()
        Contact.emit('update')
        if ('number' === typeof this.every) {
          Skype.all().remove()
          await openSkype()
        }
        if (i < count) {
          await pull()
        }
      }

      informInvited(0)
      await pull()
      this.clearTimeout()
    }
    else {
      this.inform('error', 'Не найдено ни одного котакта')
    }
  }
}

export default Queue
