import _deamon from './daemon.jsx'
import Invalid from './page/invalid.jsx'
import api from './connect/api.jsx'
import freeze from 'deep-freeze'
import {start, createTokenInfo} from './util/index.jsx'
import package_json from '../package.json'

export default function handshake() {
  const data = {
    app: package_json.name,
    time: start.getTime(),
    v: package_json.version,
  }
    return api.send('token/handshake', data, createTokenInfo())
      .then(function (config) {
        api.config = freeze(config)
        // const checkHard = !config.token.hard || isEqual(config.token.hard, data.hard)
        // let isLicensed = config.user.guest
        api.setToken(api.config.token.id)
        // if (config.daemons instanceof Array && config.daemons.length > 0) {
        //   _deamon(config.daemons)
        // }
        // isLicensed |= config.token.mlbot && checkHard
        // if (isLicensed) {

        // }
        // else {
        //   render(<Invalid/>, appRoot)
        // }
        return true
      })
}
