import {Router, Route, hashHistory} from 'react-router'
import Outdoor from './outdoor/index.jsx';
import Login from './outdoor/login.jsx';
import App from './app/index.jsx';
import Hello from './app/hello.jsx';
import React, {Component} from 'react'

window.go = function () {
  hashHistory.push.apply(hashHistory, arguments)
}

export const routes = <Route path='/'>
  <Route component={Outdoor}>
    <Route path='login' component={Login} />
  </Route>
  <Route component={App}>
    <Route path='hello' component={Hello} />
  </Route>
</Route>

const router = <Router history={hashHistory}>{routes}</Router>

export default router
