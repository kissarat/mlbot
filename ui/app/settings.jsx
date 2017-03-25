import AccountManager from '../../account-manager/index.jsx'
import api from '../../connect/api.jsx'
import BrowserLink from '../widget/browser-link.jsx'
import Contact from '../../store/contact.jsx'
import db from '../../store/database.jsx'
import fs from 'fs-promise'
import React, {Component} from 'react'
import Tabs from '../widget/tabs.jsx'
import {createTokenInfo} from '../../util/index.jsx'
import {merge, defaults, omit, map, pick} from 'lodash'
import {remote} from 'electron'
import {Segment, Button, Message, Icon} from 'semantic-ui-react'

export default class Settings extends Component {
  state = {
    contactsCount: false,
    accountsCount: false
  }

  componentWillReceiveProps() {
    void this.countContacts()
    void this.countAccounts()
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  async countContacts() {
    this.setState({contactsCount: await Contact.countAll()})
  }

  async countAccounts() {
    const account = await AccountManager.getList(true)
    this.setState({accountsCount: account.length})
  }

  clearSettings = () => {
    const preserve = pick(localStorage, 'sam', 'version', 'm.viktor.expert')
    localStorage.clear()
    merge(localStorage, preserve)
  }

  clearContacts = async() => {
    this.setState({clearContacts: true})
    await db.reset()
    await this.countContacts()
    this.setState({clearContacts: false})
  }

  clearAccounts = async() => {
    await api.del('skype/remove')
    this.countAccounts()
  }

  clearAll = async() => {
    await this.clearContacts()
    await this.clearAccounts()
    this.clearSettings()
  }

  fileExport = () => {
    // const date = moment.format('YYYY-MM-DD')
    // const defaultPath = `mlbot-${date}.json`
    const filters = [
      {name: 'JSON', extensions: ['json']}
    ]
    remote.dialog.showSaveDialog({filters}, async path => {
      if (path) {
        this.setState({fileExport: true})
        let accounts = await await AccountManager.getList(true)
        accounts = accounts.reduce((b, a) => {
          b[a.info.login] = a.info.password;
          return b
        }, {})
        let contacts = await db.contact.orderBy('time').toArray()
        const data = JSON.stringify({
            format: 'mlbot',
            version: 1,
            time: new Date().toISOString(),
            accounts,
            contacts: contacts.map(c => omit(c, 'id', 'time')),
            user: api.config.user,
            info: createTokenInfo()
          },
          null,
          '\t')
        await fs.outputFile(path, data)
        this.setState({fileExport: false})
      }
    })
  }

  fileImport = () => {
    // const date = moment.format('YYYY-MM-DD')
    // const defaultPath = `mlbot-${date}.json`
    const filters = [
      {name: 'JSON', extensions: ['json']}
    ]
    remote.dialog.showOpenDialog({filters}, async path => {
      if (path instanceof Array && 'string' === typeof path[0]) {
        this.setState({fileImport: true})
        const data = await fs.readFile(path[0])
        const {accounts, contacts} = JSON.parse(data)
        await db.contact.bulkPut(Contact.setupMany(contacts))
        const accountsToSend = map(accounts, (password, login) => ({login, password}))
        await api.send('skype/accounts', accountsToSend)
        await AccountManager.getList(true)
        await this.countContacts()
        this.setState({fileImport: false})
      }
    })
  }

  labelWithCount(label, name) {
    if ('number' === typeof this.state[name]) {
      label += ` (${this.state[name]})`
    }
    return label
  }

  clearContactsLabel = () => this.labelWithCount('Очистить копию списка контактов', 'contactsCount')
  clearAccountsLabel = () => this.labelWithCount('Очистить логины и пароли скайпов', 'accountsCount')

  render() {
    return <Segment.Group horizontal className="page settings">
      <Segment className="reset">
        <h2>Сброс данных</h2>
        <div className="control">
          <Button onClick={this.clearSettings} type="button">Очистить настройки</Button>
          <Button
            type="button"
            onClick={this.clearContacts}
            loading={this.state.clearContacts}
            content={this.clearContactsLabel()}/>
          <Button onClick={this.clearAccounts} type="button">{this.clearAccountsLabel()}</Button>
          <Button onClick={this.clearAll} type="button">Очистить все</Button>
        </div>
      </Segment>

      <Segment.Group className="about">
        <Segment.Group horizontal>
          <Segment className="backup">
            <h2>Резервное копирования</h2>
            <Button
              loading={this.state.fileExport}
              type="button"
              icon="download"
              content="Экспорт"
              onClick={this.fileExport}
            />
            <Button
              loading={this.state.fileImport}
              type="button"
              icon="upload"
              content="Импорт"
              onClick={this.fileImport}
            />
          </Segment>
          <Message color="teal">
            <Icon size="huge" name="question circle outline"/>
            Сайт программы с описанием, инструкцией по работе, помощью и поддержкой от разработчиков
            <BrowserLink href="http://inbisoft.com/mlbot/">Перейти →</BrowserLink>
          </Message>
        </Segment.Group>
        <Tabs>
          <Tabs.Panel key="1.2" title="Что нового в версии 1.2">
            <article>
              <h5>Возможности</h5>
              <ul>
                <li>рассылка по чатам</li>
                <li>получение всех контактов с чатов</li>
                <li>возможность работать в 20 аккаунтах скайпа без запущенной версии на компьютере</li>
                <li>таймер для планировки рассылки</li>
              </ul>
              и еще несколько мелких надстроек в программе...

              <h5>Исправлены ошибки</h5>
              <ul>
                <li>Скайпы с более чем 4000 контактами работают!</li>
                <li>Сообщение отправляется быстрее и без обрыва через каждые 150-300 смс.
                  Теперь на одно сообщение уходит в среднем 1 секунда, и отправляет более 1000 сообщений по одном
                  нажатии
                  кнопки;
                </li>
                <li>уменьшены окна и поля в программе, что позволит комфортно работать с программой с нетбуков;</li>
              </ul>
            </article>
          </Tabs.Panel>
          <Tabs.Panel key="2.0" title="Что нового в версии 2.0">
            <h5>Возможности</h5>
            <ul>
              <li>Добавили рассылку по группам контактов Вашего аккаунта Skype;</li>
              <li>Оптимизировали алгоритм: начало запуска заданий длиться от 3-х до 20 секунд вместо 1-5 минут;</li>
              <li>Ускорили удаление контактов в полтора раза;</li>
              <li>Добавлены ответы ошибок: введен неверный пароль, Skype нуждается в восстановлении, вышло время
                ожидания и т.д.
              </li>
              <li>Добавили время задержки между циклами рассылки по чатам;</li>
            </ul>
            <h5>Исправлены ошибки</h5>
            <ul>
              <li>Программа работает со всеми видами Skype-аккаунтов: старыми от Skype и новыми от Microsoft;</li>
              <li>Исправили добавления в друзья на все типы аккаунтов;</li>
              <li>Вытаскивание всех Skype-чатов с аккаунта (Бета).</li>
            </ul>
          </Tabs.Panel>
          <Tabs.Panel key="3.0" title="Что нового в версии 3.0" active>
          </Tabs.Panel>
        </Tabs>
      </Segment.Group>
    </Segment.Group>
  }
}
