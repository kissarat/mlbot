import processProfile from './process-profile.jsx'
import Skype from './static.jsx'
import {extend} from 'lodash'
import {Status, Type, start} from '../app/config'

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
    return new Promise(resolve => {
      this.once('message', resolve)
      this.invoke('sendMessage', [message])
    })
  },

  invite(username, greeting) {
    return new Promise(resolve => {
      this.once('invite', resolve)
      this.invoke('invite', [username, greeting])
    })
  },

  getMembers(chatId) {
    return new Promise(resolve => {
      this.once('getMembers', resolve)
      this.invoke('getMembers', [chatId])
    })
  },

  getChatConversations() {
    return new Promise(resolve => {
      this.once('getChatConversations', resolve)
      this.invoke('getChatConversations')
    })
  },

  openSettings() {
    this.invoke('openSettings')
  },

  removeContact(username) {
    return new Promise(resolve => {
      this.once('contact.remove', resolve)
      this.invoke('removeContact', [username])
    })
  },

  reloadProfile() {
    if (this.profile) {
      this.profile = null
      this.reload()
      return this.getProfile()
    }
  },

  async setProfile(profile) {
    try {
      await processProfile(profile)
      this.profile = profile
    }
    catch (ex) {
      console.error(ex)
    }
  }
})

export default Skype
