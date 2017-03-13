import _ from 'lodash'
import api from '../connect/api.jsx'
import Contact from '../store/contact.jsx'
import db from '../store/database.jsx'
import Delivery from '../ui/delivery/index.jsx'
import Dexie from 'dexie'
import Queue from '../ui/base/queue.jsx'
import Skype from '../skype/index.jsx'
import {hashHistory} from 'react-router'
import {Registry} from '../util/persistence.jsx'
import {remote} from 'electron'

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
  Registry,
  Skype,
  Queue,
}

export default Global
