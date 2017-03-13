import api from '../connect/api.jsx'
import Account from './account.jsx'
import Contact from '../store/contact.jsx'

/**
 * @property Promise.<Account[]> list
 */
export default class AccountManager {

  /**
   * @returns {Promise.<Account[]>}
   */
  static async getList(refresh = true) {
    if (refresh || !this.list) {
      this.list = (await api.get('skype/accounts'))
        .map(a => new Account(a))
    }
    return this.list
  }

  /**
   * @returns {Promise.<Account>}
   */
  static async get(login) {
    return (await this.getList()).find(a => login === a.info.login)
  }

  static async login(options) {
    const account = new Account(options)
    const skype = await account.login()
    options.contacts = []
    await api.send('skype/profile', {id: options.login}, account.info)
  }

  static async refresh(login) {
    const profileName = 'refresh ' + login
    console.profile(profileName)
    const account = await AccountManager.get(login)
    await account.login()
    await Promise.all([
      async function () {
        await account.loadContacts()
        await account.saveContacts()
        await account.saveGroups()
      },
      async function () {
        await account.loadChats()
        await account.saveChats()
      },
    ].map(a => a()))
    await Contact.emit('update')
    console.profileEnd(profileName)
  }
}
