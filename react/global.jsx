import {hashHistory} from 'react-router'
import _ from 'lodash'
import Contact from './entity/contact.jsx'
import Skype from './skype/index.jsx'
import db from './database.jsx'
import api from './connect/api.jsx'
import Dexie from 'dexie'
import {remote} from 'electron'
import Query from './store/query.jsx'
import {Registry} from './util/persistence.jsx'

function go() {
  hashHistory.push.apply(hashHistory, arguments)
}

const Global = {
  _,
  Registry,
  Contact,
  Query,
  go,
  Dexie,
  Skype,
  db,
  api,
  app: remote.app
}

export default Global
