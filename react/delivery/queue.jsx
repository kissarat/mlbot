import Contact from '../entity/contact.jsx'
import Skype from '../skype/index.jsx'
import Timeout from '../util/timeout.jsx'
import {extend} from 'lodash'
import {Status} from '../../app/config'

const DeliveryQueue = {
  async execute(account, text, inform) {
    const query = Contact.selectedQuery(account, true)
    const contactsCount = await db.contact
      .where(query)
      .count()

    if (contactsCount > 0) {
      const skype = await Skype.open(account, true)
      inform('busy', 'Подождите 3 секунды')
      await wait(3000)
      inform('busy', 'Получение списка рассылки')
      this.setTimeout(() => {
        inform('error', `Skype не отвечает в течении ${Math.round(skypeTimeout / 1000)} секунд`)
        skype.remove()
      })
      skype.openSettings()

      const informInvited = i => inform('busy', `Отправлено ${i} контактам из ${contactsCount}`)

      let i = 0
      const pull = async() => {
        const contact = await db.contact
          .where(query)
          .first()
        if (!contact) {
          return
        }
        const anwser = await skype.sendMessage({
          id: contact.id,
          login: contact.login,
          text
        })
        await db.contact.update(contact.id, {status: Status.CREATED})
        informInvited(++i)
        this.updateTimeout()
        if (i < contactsCount) {
          await pull()
        }
        Contact.emit('update')
      }

      informInvited(0)
      await pull()
      this.clearTimeout()
      inform('success', 'Рассылка завершена')
    }
    else {
      inform('error', 'Вы не выбрали ни одного контакта для рассылки')
    }
  }
}

extend(DeliveryQueue, Timeout)

export default DeliveryQueue
