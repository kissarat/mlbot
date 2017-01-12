import AccountList from './app/account-list.jsx'
import App from './app/index.jsx'
import Delivery from './app/delivery.jsx'
import Hello from './app/hello.jsx'
import Invite from './app/invite.jsx'
import Loader from './page/unavailable.jsx'
import Login from './outdoor/login.jsx'
import Outdoor from './outdoor/index.jsx'
import React, {Component} from 'react'
import SkypeLogin from './skype/login.jsx'
import Unavailable from './page/unavailable.jsx'
import {Router, Route, IndexRoute, hashHistory} from 'react-router'

window.go = function () {
  hashHistory.push.apply(hashHistory, arguments)
}

window._ = require('lodash')

export const routes = <Route path='/'>
  <IndexRoute component={Loader}/>
  <Route component={Outdoor}>
    <Route path='login' component={Login}/>
    <Route path='unavailable' component={Unavailable}/>
  </Route>
  <Route path='app' component={App}/>
  <Route component={App}>
    <Route path='accounts/login' component={SkypeLogin}/>
    <Route path='accounts' component={AccountList}/>
    <Route path='delivery/:account' component={Delivery}/>
    <Route path='delivery' component={Delivery}/>
    <Route path='invite' component={Invite}/>
    <Route path='hello' component={Hello}/>
  </Route>
</Route>

const router = <Router history={hashHistory}>{routes}</Router>

export default router
