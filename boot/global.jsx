import _ from 'lodash'
import api from '../connect/api.jsx'
import Contact from '../store/contact.jsx'
import db from '../store/database.jsx'
import Delivery from '../ui/delivery/index.jsx'
import Dexie from 'dexie'
import Queue from '../ui/base/queue.jsx'
import Skype from '../skype/index.jsx'
import AccountManager from '../account-manager/index.jsx'
import {hashHistory} from 'react-router'
import {Registry} from '../util/persistence.jsx'
import {remote} from 'electron'
import sounds from '../ui/sounds'
import App from '../ui/app/index.jsx'

function go() {
  hashHistory.push.apply(hashHistory, arguments)
}

const Global = {
  _,
  AccountManager,
  api,
  app: remote.app,
  Contact,
  db,
  Delivery,
  Dexie,
  go,
  Queue,
  Registry,
  Skype,
  sounds,
  App
}

export default Global
