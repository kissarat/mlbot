import api from '../react/connect/api.jsx'
import Account from './account.jsx'

export default class AccountManager {
  static async getList(refresh = true) {
    if (refresh || !this.list) {
      this.list = (await api.get('skype/accounts'))
        .map(a => new Account(a))
    }
    return this.list
  }

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
    await account.loadContacts()
    await account.saveContacts()
    console.profileEnd(profileName)
  }
}
