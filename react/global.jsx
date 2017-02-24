import {hashHistory} from 'react-router'
import _ from 'lodash'
import Contact from './entity/contact.jsx'
import Skype from './skype/index.jsx'
import db from './database.jsx'
import api from './connect/api.jsx'
import Dexie from 'dexie'
import {remote} from 'electron'
import Query from './store/query.jsx'
import Queue from './base/queue.jsx'
import {Registry} from './util/persistence.jsx'
import Delivery from './delivery/index.jsx'

function go() {
  hashHistory.push.apply(hashHistory, arguments)
}

const Global = {
  _,
  api,
  app: remote.app,
  Contact,
  db,
  Delivery,
  Dexie,
  go,
  Query,
  Registry,
  Skype,
  Queue,
}

export default Global
