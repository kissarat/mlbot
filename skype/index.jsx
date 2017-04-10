import processProfile from './process-profile.jsx'
import Skype from './static.jsx'
import {extend} from 'lodash'
import {Status, Type, start} from '../app/config'
import load from './load.jsx'

extend(Skype.prototype, {
  load,
  
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
    return new Promise(resolve => {
      this.once('profile', resolve)
      this.invoke('getProfile')
    })
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

  getContacts(id) {
    return new Promise(resolve => {
      this.once('getContacts', resolve)
      this.invoke('getContacts', [id])
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

  getPerformance() {
    return new Promise(resolve => {
      this.once('getPerformance', resolve)
      this.invoke('getPerformance')
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
