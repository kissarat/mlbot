import {readChatList} from '../store/sqlite.jsx'
import db from '../store/database.jsx'
import {Status, Type} from  '../app/config'
import {isEmpty, map, each} from 'lodash'

async function loadDesktopChatList() {
  const account = this.id
  const existing = await this.queryChatList().toArray()
  const chats = await readChatList(account)
  if (isEmpty(chats)) {
    return false
  }
  for (const chat of existing) {
    if (chats[chat.login]) {
      delete chats[chat.login]
    }
  }
  if (!isEmpty(chats)) {
    await db.contact.bulkPut(map(chats, (name, login) => {
      const id = account + '~' + login
      return {
        id,
        account,
        login,
        name,
        type: Type.CHAT,
        authorized: 1,
        status: Status.NONE,
        time: this.nextId()
      }
    }))
  }
  return true
}

export default {loadDesktopChatList}
