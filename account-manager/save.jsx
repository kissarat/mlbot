import db from '../store/database.jsx'
import striptags from 'striptags'
import {AllHtmlEntities} from 'html-entities'
import {exclude, Type, Status} from '../app/config'
import {isSkypeUsername} from '../util/index.jsx'
import {pick, defaults, extend, isObject, isEmpty, identity} from 'lodash'

async function saveContacts() {
  const contacts = []
  const existing = await db.contact
    .filter(c => this.id === c.account && Type.PERSON === c.type)
    .toArray()
  this.internal.contactsService.contacts.forEach(c => {
    const match = /^8:(.*)$/.exec(c.mri)
    if (match && !c.blocked && isSkypeUsername(match[1]) && exclude.indexOf(match[1])) {
      const login = match[1]
      const id = this.id + '~' + login
      const found = existing.find(x => id === x.id)
      const contact = {
        type: Type.PERSON,
        id,
        login,
        account: this.id,
        mri: c.mri,
        name: c.display_name,
        authorized: c.authorized ? 1 : 0,
        favorite: c.favorite ? 1 : 0,
        status: found ? found.status : Status.NONE,
        created: new Date(c.creation_time).getTime(),
        time: found ? found.time : this.nextId(),
        groups: []
      }
      if (isObject(c.profile.phones) && isEmpty(c.profile.phones)) {
        contact.phones = {}
        c.profile.phones.forEach(p => contact.phones[p.type] = p.number)
      }
      if (c.locations instanceof Array && c.locations.length > 0) {
        ['country', 'city'].forEach(name => contact[name] = c.locations[0][name])
      }
      if ('string' === typeof c.profile.language) {
        contact.language = c.profile.language
      }
      if ('string' === typeof c.profile.gender) {
        contact.sex = c.profile.gender
      }
      if ('string' === typeof c.profile.nick) {
        contact.nick = c.profile.nick
      }
      if ('string' === typeof c.profile.avatar_url) {
        contact.avatar = c.profile.avatar_url
      }
      if (c.authorized && db.INVITED === contact.status) {
        contact.status = Status.NONE
      }
      contacts.push(contact)
    }
  })
  const absent = contacts
    .filter(c => !existing.find(x => c.id == x.id))
    .map(c => c.id)
  await db.contact.bulkDelete(absent)
  await db.contact.bulkPut(contacts)
}

async function saveChats() {
  const account = this.id
  const existing = await this.queryChatList().toArray()
  const contacts = []
  const absent = []

  const entities = new AllHtmlEntities()
  this.conversations.forEach(c => {
    const chatId = /19:([0-9a-f]+)@thread\.skype/.exec(c.id)
    if (chatId) {
      const login = chatId[1]
      const id = account + '~' + login
      const found = existing.find(x => id === x.id)
      const available = isObject(c.threadProperties)
        && c.threadProperties.topic
        && !c.threadProperties.lastleaveat
        && !isEmpty(c.lastMessage)
      if (available) {
        try {
          const name = striptags(entities.decode(c.threadProperties.topic))
            .replace(/\s+/g, ' ')
            .trim()
          contacts.push({
            type: Type.CHAT,
            id,
            account,
            login,
            name,
            authorized: 1,
            status: found ? found.status : Status.NONE,
            time: found ? found.time : this.nextId()
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
}

async function saveGroups() {
  const account = this.id
  const existing = await db.group
    .filter(c => account === c.account)
    .toArray()
  let contacts = await db.contact.filter(c => account === c.account).toArray()
  const groups = this.internal.contactsService.groups.map(function (g) {
    const group = {
      account,
      id: g.id,
      name: g.name,
      contacts: []
    }
    g.contacts.forEach(function (mri) {
      const contact = contacts.find(c => mri === c.mri)
      if (!contact) {
        return console.error('Contact is not found', mri)
      }
      if (contact.groups instanceof Array) {
        contact.groups.push(g.id)
      }
      else {
        console.error('Contact groups is not initialized', contact.login)
      }
      group.contacts.push(contact.login)
    })
    return group
  })
  const absent = groups
    .filter(c => !existing.find(x => c.id == x.id))
    .map(c => c.id)
  await db.group.bulkDelete(absent)
  await db.group.bulkPut(groups)
  await db.contact.bulkPut(contacts)
}

export default {saveContacts, saveChats, saveGroups}
