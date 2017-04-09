import Account from './account.jsx'
import Contact from '../store/contact.jsx'
import db from '../store/database.jsx'

/**
 * @property Promise.<Account[]> list
 */
export default class AccountManager {

  /**
   * @returns {Promise.<Account[]>}
   */
  static async getList(refresh = false) {
    if (refresh || !(this.list instanceof Array)) {
      /**
       * @type Array[]
       */
      const list = await db.account.orderBy('id').toArray()
      for (const account of list) {
        account.initialize()
      }
      this.list = list
    }
    return this.list
  }

  /**
   * @param {string} id
   * @return {Promise.<Account>}
   */
  static async get(id) {
    const list = await this.getList()
    return list.find(a => id === a.id)
  }

  /**
   * @param {Object} options
   * @return {Promise.<Account>}
   */
  static async login(options) {
    const account = new Account()
    account.initialize(options)
    await account.login()
    await account.save()
    delete this.list
    return account
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
        // await account.saveGroups()
      },
      async function () {
        await account.loadChats()
        await account.saveChats()
        if (account.desktop) {
          await account.loadDesktopChatList()
        }
      },
    ].map(a => a()))
    Contact.emit('update')
    console.profileEnd(profileName)
  }

  static async closeWebSkype(id, necessarily) {
    const account = await this.get(id)
    if (account) {
      account.closeWebSkype(necessarily)
    }
  }
}
