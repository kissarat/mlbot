import _ from 'lodash'
import AccountManager from '../account-manager/index.jsx'
import api from '../connect/api.jsx'
import App from '../ui/app/index.jsx'
import config from '../app/config'
import Contact from '../store/contact.jsx'
import db from '../store/database.jsx'
import Delivery from '../ui/delivery/index.jsx'
import Dexie from 'dexie'
import freeze from 'deep-freeze'
import Job from '../account-manager/job.jsx'
import merge from 'deepmerge'
import Queue from '../ui/base/queue.jsx'
import request from 'request-promise'
import Skype from '../skype/index.jsx'
import sounds from '../ui/sounds'
import {hashHistory} from 'react-router'
import {Registry} from '../util/persistence.jsx'
import {remote} from 'electron'
import agent from '../util/user-agent.jsx'

function go() {
  hashHistory.push.apply(hashHistory, arguments)
}

const Global = {
  _,
  _require: global['req' + 'uire'],
  AccountManager,
  agent,
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
  request,
  Skype,
  sounds,
}

export default Global
