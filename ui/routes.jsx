import AccountList from './account/index.jsx'
import App from './app/index.jsx'
import config from '../app/config'
import Delivery from './delivery/index.jsx'
import Invite from './invite/index.jsx'
import Loader from './page/unavailable.jsx'
import Login from './outdoor/login.jsx'
import Outdoor from './outdoor/index.jsx'
import package_json from '../app/package.json'
import React from 'react'
import Settings from './app/settings.jsx'
import Journal from './journal/index.jsx'
import AccountEdit from './account/edit.jsx'
import Unavailable from './page/unavailable.jsx'
import {Router, Route, IndexRoute, hashHistory} from 'react-router'

document.title = document.title.replace('Beta', 'v' + package_json.version + ('club-leader' === config.vendor ? ' Beta' : ''))
if ('club-leader' !== config.vendor) {
  document.getElementById('club-leader').remove()
}

try {
  // require('request-debug')(require('request'))
}
catch (ex) {

}

export const routes = <Route path='/'>
  <IndexRoute component={Loader}/>
  <Route component={Outdoor}>
    <Route path='login' component={Login}/>
    <Route path='unavailable' component={Unavailable}/>
  </Route>
  <Route component={App}>
    <Route path='accounts/login' component={AccountEdit}/>
    <Route path='accounts/edit/:id' component={AccountEdit}/>
    <Route path='accounts' component={AccountList}/>
    <Route path='journal' component={Journal}/>
    <Route path='delivery/:type' component={Delivery}/>
    <Route path='invite/:account' component={Invite}/>
    <Route path='invite' component={Invite}/>
    <Route path='settings' component={Settings}/>
  </Route>
</Route>

const router = <Router history={hashHistory}>{routes}</Router>

export default router
