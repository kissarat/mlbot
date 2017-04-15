import db from '../store/database.jsx'
import striptags from 'striptags'
import {AllHtmlEntities} from 'html-entities'
import {exclude, Type, Status} from '../app/config'
import {isSkypeUsername} from '../util/index.jsx'
import {pick, defaults, extend, isObject, isEmpty, identity} from 'lodash'

async function saveContacts(rawContacts = this.contacts) {
  const contacts = []
  const existing = await db.contact
    .filter(c => this.id === c.account && Type.PERSON === c.type)
    .toArray()
  for (const c of rawContacts) {
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
      if (c.emails instanceof Array && c.emails.length > 0) {
        contact.emails = c.emails
      }
      if (isObject(c.profile.phones) && !isEmpty(c.profile.phones)) {
        contact.phones = {}
        c.profile.phones.forEach(p => contact.phones[p.type] = p.number)
      }
      if (c.profile.locations instanceof Array && c.profile.locations.length > 0) {
        if (c.profile.locations[0].country) {
          contact.country = c.profile.locations[0].country.toUpperCase()
        }
        if (c.profile.locations[0].city) {
          contact.city = c.profile.locations[0].city
        }
      }
      if ('string' === typeof c.profile.language) {
        contact.language = c.profile.language.toUpperCase()
      }
      if ('string' === typeof c.profile.birthday) {
        const birthday = new Date(c.profile.birthday).getTime()
        if (isFinite(birthday)) {
          contact.birthday = birthday
        }
      }
      const stringMap = {
        sex: 'gender',
        nick: 'nick',
        avatar: 'avatar_url',
        site: 'website',
        about: 'about',
        mood: 'mood'
      }
      for(const name in stringMap) {
        let value
        if ('string' === typeof c.profile[stringMap[name]] && (value = c.profile[stringMap[name]].trim())) {
          contact[name] = value
        }
      }
      if (c.authorized && db.INVITED === contact.status) {
        contact.status = Status.NONE
      }
      contacts.push(contact)
    }
  }
  const absent = contacts
    .filter(c => !existing.find(x => c.id == x.id))
    .map(c => c.id)
  await db.contact.bulkDelete(absent)
  for (const contact of contacts) {
    if (contact.authorized && !this.updatedContacts.find(c => c.skype === contact.login)) {
      const optimized = pick(contact, 'name', 'created', 'country', 'phones', 'emails', 'site', 'about', 'mood',
        'city', 'language', 'birthday', 'sex', 'avatar')
      optimized.skype = contact.login
      this.updatedContacts.push(optimized)
    }
  }
  await db.contact.bulkPut(contacts)
  this.debounce('sendUpdatedContacts')
}

async function saveChats(conversations = this.conversations) {
  const account = this.id
  const existing = await this.queryChatList().toArray()
  const contacts = []
  const absent = []

  const entities = new AllHtmlEntities()
  for (const c of conversations) {
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
  }

  await db.contact.bulkDelete(absent)
  await db.contact.bulkPut(contacts)
  this.status = 'contacts'
}

async function saveGroups(groups = this.internal.contactsService.groups) {
  const account = this.id
  const existing = await db.group
    .filter(c => account === c.account)
    .toArray()
  let contacts = await db.contact.filter(c => account === c.account).toArray()
  groups = groups.map(function (g) {
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
