const freeze = require('deep-freeze')
const merge = require('deepmerge')
import _ from 'lodash'
import AccountManager from '../account-manager/index.jsx'
import api from '../connect/api.jsx'
import App from '../ui/app/index.jsx'
import config from '../app/config'
import Contact from '../store/contact.jsx'
import db from '../store/database.jsx'
import Delivery from '../ui/delivery/index.jsx'
import Dexie from 'dexie'
import Job from '../account-manager/job.jsx'
import Queue from '../ui/base/queue.jsx'
import run from './run.jsx'
import Skype from '../skype/index.jsx'
import sounds from '../ui/sounds'
import {hashHistory} from 'react-router'
import {Registry} from '../util/persistence.jsx'
import {remote} from 'electron'

function go() {
  hashHistory.push.apply(hashHistory, arguments)
}

const Global = {
  _,
  AccountManager,
  api,
  App,
  app: remote.app,
  config,
  Contact,
  db,
  Delivery,
  Dexie,
  freeze,
  go,
  Job,
  merge,
  Queue,
  Registry,
  run,
  Skype,
  sounds,
}

export default Global
