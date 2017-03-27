import api from '../connect/api.jsx'
import Account from './account.jsx'
import Contact from '../store/contact.jsx'
import config from '../app/config'

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
    const list = await this.getList()
    return list.find(a => login === a.info.login)
  }

  static async login(options) {
    const start = Date.now()
    const account = new Account(options)
    await account.login()
    await account.saveProfile({
      spend: Date.now() - start
    })
  }

  static async refresh(login) {
    // const profileName = 'refresh ' + login
    // console.profile(profileName)
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
        if (config.desktop.loadChatList) {
          await account.loadDesktopChatList()
        }
      },
    ].map(a => a()))
    await Contact.emit('update')

    if (account.info.time && (Date.now() - account.info.time > (48 * 3600 * 1000))) {
      this.saveProfile()
    }
    // console.profileEnd(profileName)
  }
}
