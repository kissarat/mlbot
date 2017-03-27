import fs from 'fs'
import fs_promise from 'fs-promise'
import knex from 'knex'
import os from 'os'
import path from 'path'
import {isObject} from 'lodash'

const directories = [
  'Application Data/Skype',
  'AppData/Roaming/Skype',
  'Library/Application Support/Skype',
  '.Skype'
]
  .map(dir => path.join.apply(null, [os.homedir()].concat(dir.split('/'))))

const SkypeStatus = {
  DIR_NOT_FOUND: -1,
  FILE_NOT_FOUND: -2,
}

// const ConversationType = {
//   Contact: 1,
//   Chat: 2
// }

let baseDir

export async function skype(username) {
  if (!baseDir) {
    for (const dir of directories) {
      try {
        fs.accessSync(dir)
        baseDir = dir
        break
      }
      catch (ex) {
      }
    }
  }
  if (!baseDir) {
    return SkypeStatus.DIR_NOT_FOUND
  }
  const sqliteFile = username + '/main.db'
  let filename = path.join(baseDir, sqliteFile)
  try {
    fs.accessSync(filename)
  }
  catch (ex) {
    return SkypeStatus.FILE_NOT_FOUND
  }

  try {
    fs.accessSync(filename + '-journal')
    const tmp = path.join(os.tmpdir(), sqliteFile)
    try {
      fs.accessSync(tmp)
    }
    catch (ex) {
      await fs_promise.copy(filename, tmp)
    }
    filename = tmp
  }
  catch (ex) {
  }

  return knex({
    client: 'sqlite3',
    connection: {filename}
  })
}

export async function readChatList(username) {
  const db = await skype(username)
  if (isObject(db)) {
    const rows = await db.raw(`
      SELECT
        identity,
        type,
        displayname
      FROM Conversations
      WHERE type = 2 AND displayname IS NOT NULL AND identity LIKE '19:%@thread.skype'`)
    const chats = {}
    for(const row of rows) {
      chats[/19:(\w+)@thread\.skype/.exec(row.identity)[1]] = row.displayname
    }
    return chats
  }
}
