import Indicator from './indicator.jsx'
import package_json from '../../app/package.json'
import React, {Component, isValidElement} from 'react'
import {hashHistory} from 'react-router'
import {Menu, Image} from 'semantic-ui-react'
import api from '../../connect/api.jsx'

function itemUrl(url) {
  return {
    active: location.hash.slice(1).indexOf(url) === 0,
    onClick() {
      hashHistory.push(url)
    }
  }
}

export default class AppMenu extends Component {
  async logout() {
    await api.logout()
    hashHistory.push('/login')
  }

  render() {
    return <Menu icon="labeled" compact borderless>
      <Menu.Item className="logo">
        <Image src="images/menu-logo.png"/>
        <span className="version">версия {package_json.version}</span>
      </Menu.Item>
      <Menu.Menu position="right">
        <Menu.Item>
          <Indicator/>
        </Menu.Item>
        <Menu.Item
          name="Аккаунт"
          icon="skype"
          {...itemUrl('/accounts')}
          title="Добавляйте и удаляйте аккаунты Skype. Если возникнет ошибка, попробуйте войти на web.skype.com в браузере"/>
        <Menu.Item
          name="Рассылка"
          icon="mail"
          {...itemUrl('/delivery/person')}
          title="Если закроете программу на рассылке — Вы сможете ее продолжить при следующем запуске с места окончания рассылки"/>
        <Menu.Item
          name="Чат-рассылка"
          className="chat-delivery"
          icon="comments" {...itemUrl('/delivery/chat')}
          title="Рассылайте рекламу по чатам, задав необходимое количество циклов"/>
        <Menu.Item
          name="Добавить друзей"
          icon="group"
          {...itemUrl('/invite')}
          title="Добавляйте в друзья 40 человек в день на аккаунт для избежание блокировки"/>
        <Menu.Item
          name="Журнал"
          icon="history"
          {...itemUrl('/journal')}/>
        <Menu.Item
          name="Настройки"
          icon="setting"
          {...itemUrl('/settings')}
          title="Сбросьте настройки программы или очистите историю использования. Импортируйте и экспортируйте настройки и историю с помощью функций импорт/экспорт"/>
        <Menu.Item
          name="Выход"
          icon="sign out"
          onClick={this.logout}/>
        <Menu.Item
          name="Перезапуск"
          icon="refresh"
          onClick={() => location.reload()}
          title="При перезапуске текст, аккаунты, настройки и списки контактов сохранятся"/>
      </Menu.Menu>
    </Menu>
  }
}
