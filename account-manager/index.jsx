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
  static async getList() {
    const list = await db.account.orderBy('id').toArray()
    for(const account of list) {
      account.initialize()
    }
    return list
  }

  /**
   * @returns {Promise.<Account>}
   */
  static async get(login) {
    const list = await this.getList()
    return list.find(a => login === a.info.login)
  }

  static async login(options) {
    // const start = Date.now()
    const account = new Account()
    account.initialize(options)
    await account.login()
    await account.save()
    // void account.sendProfile({
    //   spend: Date.now() - start
    // })
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
        if (account.desktop) {
          await account.loadDesktopChatList()
        }
      },
    ].map(a => a()))
    Contact.emit('update')

    // if (account.time && (Date.now() - account.time > (48 * 3600 * 1000))) {
    //   await this.save()
    //   void this.sendProfile()
    // }
    // console.profileEnd(profileName)
  }
}
