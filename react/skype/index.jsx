import db from '../database.jsx'
import Skype from './static.jsx'
import {clear} from '../util/index.jsx'
import {EventEmitter} from 'events'
import {extend, toArray, each} from 'lodash'
import {Status, start} from '../../app/config'
import Contact from '../entity/contact.jsx'
import {millisecondsId, isSkypeUsername} from '../util/index.jsx'

extend(Skype.prototype, {
  login(username, password) {
    this.invoke('login', [username, password])
  },

  loginPassword(username, password) {
    return new Promise((resolve, reject) => {
      this.invoke('login', [username, password])
      this.on('login.error', reject)
    })
  },

  waitSelector(selector) {
    return new Promise(resolve => {
      this.once(selector, resolve)
      this.invoke('waitSelector', [selector])
    })
  },

  confirmIdentity() {
    return new Promise(resolve => {
      this.once('confirm', resolve)
      this.invoke('confirmIdentity')
    })
  },

  logout() {
    this.invoke('logout')
  },

  async getProfile() {
    return this.profile || await new Promise(resolve => this.on('contacts', profile => resolve(profile)))
  },

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      this.once('message', resolve)
      this.invoke('sendMessage', [message])
    })
  },

  invite(contact) {
    return new Promise((resolve, reject) => {
      this.invoke('invite', [contact])
      this.once('invite', resolve)
    })
  },

  openSettings() {
    this.invoke('openSettings')
  },

  insertSpaceInterval() {
    this.invoke('insertSpaceInterval')
  },

  async setProfile(profile) {
    try {
      profile.contacts = profile.contacts
        .filter(c => 'skype' === c.type && !c.blocked && 'echo123' != c.id)
      const exclude = ['avatar_url', 'display_name_source', 'name',
        'person_id', 'auth_certificate', 'blocked', 'type']
      profile.contacts.forEach(function (contact) {
        exclude.forEach(function (key) {
          delete contact[key]
        })
      })
      clear(profile)
      await this.sendProfile(profile)
      this.profile = profile
    }
    catch (ex) {
      console.error(ex)
    }
  },

  async sendProfile(profile) {
    await api.send('skype/profile', {id: profile.login}, profile)
    const existing = await db.contact
      .filter(c => profile.login === c.account)
      .toArray()
    const g = millisecondsId()
    const contacts = []
    profile.contacts.forEach(function (c) {
      if (isSkypeUsername(c.id)) {
        const id = profile.login + '~' + c.id
        const found = existing.find(x => id === x.id)
        const contact = {
          id,
          account: profile.login,
          login: c.id,
          name: c.display_name,
          authorized: c.authorized ? 1 : 0,
          status: found ? found.status : Status.CREATED,
          time: found ? found.time : g.next().value
        }
        if (c.authorized && db.INVITED === contact.status) {
          contact.status = Status.CREATED
        }
        contacts.push(contact)
      }
    })
    const absent = contacts
      .filter(c => !existing.find(x => c.id == x.id))
      .map(c => c.id)
    await db.contact.bulkDelete(absent)
    await db.contact.bulkPut(contacts)
    Contact.emit('update', {account: profile.login})
    return this
  },

  reloadProfile() {
    if (this.profile) {
      this.profile = null
      this.reload()
      return this.getProfile()
    }
  },

  invite(username) {
    return new Promise(resolve => {
      this.once('invite', resolve)
      this.invoke('invite', [username])
    })
  }
})

export default Skype
