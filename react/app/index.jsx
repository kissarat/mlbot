window.skypeTimeout = 90 * 1000
import package_json from '../../app/package.json'
import Footer from '../widget/footer.jsx'
import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import {Menu, Segment, Image, Dimmer, Loader} from 'semantic-ui-react'
import api from '../connect/api.jsx'
import {each, defaults} from 'lodash'
import SingletonComponent from '../base/singleton-component.jsx'

function itemUrl(url) {
  return {
    active: location.hash.slice(1).indexOf(url) === 0,
    onClick() {
      hashHistory.push(url)
    }
  }
}

export default class App extends SingletonComponent {
  state = {
    busy: false
  }

  static setBusy(busy) {
    this.set({busy})
  }

  async logout() {
    await api.logout()
    hashHistory.push('/login')
  }

  componentDidMount() {
    setTimeout(function () {
        if (!(isObject(api.config.user) && 'string' === typeof api.config.user.nick)) {
          location.reload()
        }
      }
      , 500)
  }

  render() {
    return <div className="layout app">
      <Dimmer active={!!this.state.busy} inverted>
        <Loader
          size="medium"
          content={'string' === typeof this.state.busy ? this.state.busy : ''}/>
      </Dimmer>
      <Menu icon="labeled" compact borderless>
        <Menu.Item className="logo">
          <Image src="images/menu-logo.png"/>
          <span className="version">версия {package_json.version}</span>
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item
            name="Аккаунт"
            icon="skype"
            {...itemUrl('/accounts')}
            title="Здесь вы можете добавляти и удалять в список аккаунтов.
              Если возникнет неизвестная ошибка, проверьте, возможно
              ли ввойти в скайп в веб версии скайпа в вашем браузере"/>
          <Menu.Item
            name="Рассылка"
            icon="mail"
            {...itemUrl('/delivery/person')}
            title="Осуществляйте рассылку собеседникам здесь.
            Во время рассылки вы можете выключить скайп,
            после следующего запуска рассылка возобновится з места,
            на котором была прервана"/>
          <Menu.Item
            name="Чат-рассылка"
            icon="comments" {...itemUrl('/delivery/chat')}
            title="Рассылку по чатам можно выполнять несколько раз подряд"/>
          <Menu.Item
            name="Добавить друзей"
            icon="group"
            {...itemUrl('/invite')}
            title="Добавлять в друзья следует не больше 40 человек на аккаунт
              для избежания блокирования. Именно иза превишения этого условного
              лимита самое большое количество аккаунтов блокируется"/>
          <Menu.Item
            name="Настройки"
            icon="setting"
            {...itemUrl('/settings')}
          title="Вы можете сбросить определенные данные связаные с вашими аккаунтами
            и ввостановить настройки по-умолчанию. Вы можете сохраник копию своих
            аккаунтов и контактов с помощью експорта, а потом открыть еще раз резервную
            копию с помощью импорта"/>
          <Menu.Item
            name="Выход"
            icon="sign out"
            onClick={this.logout}
            title="Вы всегда можете ввостановить пароль в кабинете kab.club-leader.com"/>
          <Menu.Item
            name="Перезапуск"
            icon="refresh"
            onClick={() => location.reload()}
          title="Не бойтесь перезапускать, ваш текст и списки будут сохранены"/>
        </Menu.Menu>
      </Menu>
      <Segment className="content">{this.props.children}</Segment>
      <Footer/>
    </div>
  }
}
