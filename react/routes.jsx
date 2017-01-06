import App from './app/index.jsx'
import Hello from './app/hello.jsx'
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

export const routes = <Route path='/'>
  <IndexRoute component={Loader}/>
  <Route component={Outdoor}>
    <Route path='login' component={Login}/>
    <Route path='unavailable' component={Unavailable}/>
  </Route>
  <Route path='app' component={App}/>
  <Route component={App}>
    <Route path='skype/login' component={SkypeLogin}/>
    <Route path='hello' component={Hello}/>
  </Route>
</Route>

const router = <Router history={hashHistory}>{routes}</Router>

export default router
