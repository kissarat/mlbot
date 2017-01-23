import {hashHistory} from 'react-router'
import _ from 'lodash'
import Contact from './entity/contact.jsx'

const Global = {
  _,
  go() {
    hashHistory.push.apply(hashHistory, arguments)
  },
  Contact
}

export default Global
