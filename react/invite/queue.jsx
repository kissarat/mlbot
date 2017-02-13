import Contact from '../entity/contact.jsx'
import Skype from '../skype/index.jsx'
import Timeout from '../util/timeout.jsx'
import {extend} from 'lodash'
import {Status} from '../../app/config'

const InviteQueue = {
  async execute(account, greeting, inform) {
    this.timeoutDuration = skypeTimeout
    let count = await Contact.queue().count()
    if (count <= 0) {
      return void inform('error', 'Все контакты уже добавлены')
    }

    inform('warning', 'Вход в скайп')
    const skype = await Skype.open(account, true)
    this.setTimeout(() => {
      const seconds = Math.round(skypeTimeout / 1000)
      inform('error', `Skype не отвечает в течении ${seconds} секунд`)
      skype.remove()
    })
    skype.openSettings()

    if (count > 40) {
      count = 40
    }

    const informInvited = i => inform('busy', `Приглашено ${i} контактов из ${count}`)

    let i = 0
    const pull = async() => {
      const contact = await Contact.queue().first()
      const answer = 'string' === typeof greeting
        ? skype.invite(contact.login, greeting.trim())
        : skype.invite(contact.login)
      if (Status.ABSENT === answer.status) {
        inform('busy', `Контакт ${contact.login} не существует!`)
        await db.contact.delete(contact.id)
      }
      else {
        await db.contact.update(contact.id, {status: Status.CREATED})
      }
      informInvited(++i)
      this.updateTimeout()
      Contact.emit('update')
      if (i < count) {
        await pull()
      }
    }

    informInvited(0)
    await pull()
    this.clearTimeout()
    inform('success', 'Все приглашены!')
  }
}

extend(InviteQueue, Timeout)

export default InviteQueue
