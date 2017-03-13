import AccountManager from '../../account-manager/index.jsx'
import Contact from '../../store/contact.jsx'
import React from 'react'
import Timeout from '../../util/timeout.jsx'
import {extend, merge} from 'lodash'
import {Status} from '../../app/config'

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
  }
})

Queue.prototype = {
  __proto__: Timeout,

  async execute() {
    this.timeoutDuration = skypeTimeout
    const count = await this.query()
      .count()

    if (count > 0) {
      const max = this.max < count ? this.max : count
      this.inform('busy', 'Входа в скайп')
      const skype = await AccountManager.get(this.account)
      this.inform('busy', 'Получение списка контактов')
      this.setTimeout(() => {
        const seconds = Math.round(this.timeoutDuration / 1000)
        this.inform('error', `Skype не отвечает в течении ${seconds} секунд`)
      })
      if (this.beforeIteration instanceof Function) {
        console.warn('beforeIteration')
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
        if (i < max) {
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
