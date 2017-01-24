import {hashHistory} from 'react-router'
import _ from 'lodash'
import Contact from './entity/contact.jsx'
import stateStorage from './util/state-storage.jsx'
import Skype from './skype/index.jsx'
import db from './database.jsx'
import api from './connect/api.jsx'
import Dexie from 'dexie'
import {remote} from 'electron'

function go() {
  hashHistory.push.apply(hashHistory, arguments)
}

const Global = {
  _,
  Contact,
  go,
  stateStorage,
  Dexie,
  Skype,
  db,
  api,
  app: remote.app
}

export default Global
