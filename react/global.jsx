import {hashHistory} from 'react-router'
import _ from 'lodash'
import Contact from './entity/contact.jsx'
import stateStorage from './util/state-storage.jsx'
import Skype from './skype/index.jsx'
import db from './database.jsx'
import api from './connect/api.jsx'

function go() {
  hashHistory.push.apply(hashHistory, arguments)
}

const Global = {
  _,
  Contact,
  go,
  stateStorage,
  Skype,
  db,
  api,
}

export default Global
