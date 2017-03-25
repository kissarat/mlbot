import config from '../app/config'
import Contact from '../store/contact.jsx'
import db from '../store/database.jsx'
import Skype from './static.jsx'
import striptags from 'striptags'
import {AllHtmlEntities} from 'html-entities'
import {clear} from '../util/index.jsx'
import {millisecondsId, isSkypeUsername} from '../util/index.jsx'
import {toArray, each, isObject, isEmpty} from 'lodash'

export default async function processProfile(profile) {
  profile.contacts = profile.contacts
    .filter(c => 'skype' === c.type && !c.blocked && config.exlude.indexOf(c.id) < 0)
  const exclude = ['avatar_url', 'display_name_source', 'name',
    'person_id', 'auth_certificate', 'blocked', 'type']
  profile.contacts.forEach(function (contact) {
    exclude.forEach(function (key) {
      delete contact[key]
    })
  })
  clear(profile)

  await api.send('skype/profile', {id: profile.login}, profile)
  const existing = await db.contact
    .filter(c => profile.login === c.account)
    .toArray()
  const g = millisecondsId()
  const contacts = []
  const entities = new AllHtmlEntities()
  profile.contacts.forEach(function (c) {
    if (isSkypeUsername(c.id)) {
      const id = profile.login + '~' + c.id
      const found = existing.find(x => id === x.id)
      const contact = {
        type: config.Type.PERSON,
        id,
        account: profile.login,
        login: c.id,
        name: c.display_name,
        authorized: c.authorized ? 1 : 0,
        status: found ? found.status : config.Status.NONE,
        time: found ? found.time : g.next().value
      }
      if (c.authorized && db.INVITED === contact.status) {
        contact.status = config.Status.NONE
      }
      contacts.push(contact)
    }
  })
  const absent = contacts
    .filter(c => !existing.find(x => c.id == x.id))
    .map(c => c.id)
  profile.conversations.forEach(function (c) {
    const chatId = /19:([0-9a-f]+)@thread\.skype/.exec(c.id)
    if (chatId) {
      const login = chatId[1]
      const id = profile.login + '~' + login
      const found = existing.find(x => id === x.id)
      const available = isObject(c.threadProperties)
        && c.threadProperties.topic
        && !c.threadProperties.lastleaveat
      // && !isEmpty(c.lastMessage)
      if (available) {
        try {
          const name = striptags(entities.decode(c.threadProperties.topic))
            .replace(/\s+/g, ' ')
            .trim()
          contacts.push({
            type: config.Type.CHAT,
            id,
            account: profile.login,
            login,
            name,
            authorized: 1,
            status: found ? found.status : config.Status.NONE,
            time: found ? found.time : g.next().value
          })
        }
        catch (ex) {
          console.error(ex)
        }
      }
      else if (found) {
        absent.push(id)
      }
    }
  })
  await db.contact.bulkDelete(absent)
  await db.contact.bulkPut(contacts)
  Skype.emit('contacts', {profile})
  Contact.emit('update', {account: profile.login})
}
