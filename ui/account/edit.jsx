import Account from '../../account-manager/account.jsx'
import AccountManager from '../../account-manager/index.jsx'
import Alert from '../../ui/widget/alert.jsx'
import FormComponent from '../../ui/base/form-component.jsx'
import React, {Component} from 'react'
import Skype from '../../skype/index.jsx'
import {Button, Form, Segment, Header, Icon} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {Link} from 'react-router'
import {getBaseDirectory} from '../../store/sqlite'
import {pick} from 'lodash'

const oses = {
  win32: 'Windows',
  darwin: 'macOS',
  linux: 'Linux'
}

export default class AccountEdit extends FormComponent {
  state = {busy: false}

  componentWillMount() {
    void this.load(this.props)
  }

  componentWillReceiveProps(props) {
    void this.load(props)
  }

  async load(props) {
    const account = new Account()
    if (props.params.id) {
      await account.load(this.props.params.id)
    }
    else {
      account.initialize()
    }
    const profile = account.getProfile()
    profile.desktopExists = await getBaseDirectory()
    this.setState(profile)
  }

  onSubmit = async e => {
    e.preventDefault()
    let error = false
    this.setState({busy: true})
    try {
      if (this.state.check) {
        await AccountManager.login(pick(this.state,
          'id', 'password', 'desktop', 'web', 'min', 'max', 'max_invite', 'headers'))
      }
      else {
        const account = new Account()
        account.initialize(this.state)
        await account.save()
      }
      delete AccountManager.list
      return void hashHistory.push('/accounts')
    }
    catch (err) {
      console.error(err)
      if ('username' === err.kind || 'password' === err.kind) {
        error = 'Неверный логин или пароль'
      }
      else if ('confirm' === err.kind) {
        error = `Ваш Skype-аккаунт нуждается в проверке.
          Откройте ваше Skype-приложения и подтвердите его с помощью email или SMS`
      }
      else if ('abuse' === err.kind) {
        error = `Ваш аккаунт заблокирован.
          Откройте ваше Skype-приложения и подтвердите его с помощью email или SMS`
      }
      else {
        const string = err.message || err.toString()
        error = '[object Object]' === string ? 'Неизвестная ошибка' : string
      }
      Skype.removeAll()
    }
    this.setState({
      error,
      busy: false
    })
  }

  desktop() {
    if (this.state.desktopExists) {
      return <Form.Checkbox
        name="desktop"
        label={`Использовать данные установленного в ${oses[process.platform]} приложения Skype`}
        checked={this.state.desktop || false}
        onChange={this.onCheck}/>
    }
  }

  render() {
    return <Segment className="page account edit">
      <div className="top">
        <Header as="h1">{this.props.params.id ? 'Настройка аккаунта' : 'Вход в'} Skype</Header>
        <Link className="back" to="/accounts">
          <Icon name="chevron circle left" size="large"/>
          Вернуться к списку аккаунтов
        </Link>
      </div>
      <Form
        onSubmit={this.onSubmit}
        error={!!this.state.error}
        loading={this.state.busy}>
        {this.state.error ? <Alert error content={this.state.error}/> : ''}
        <Form.Input
          name="id"
          placeholder="Введите логин Skype"
          value={this.state.id || ''}
          onChange={this.onChange}/>
        <Form.Input
          name="password"
          placeholder="Введите пароль Skype"
          type="password"
          value={this.state.password || ''}
          onChange={this.onChange}/>
        <Form.Input
          name="max_invite"
          type="number"
          label="Максимальное количество приглашиений в день"
          value={this.state.max_invite || 0}
          onChange={this.onChange}/>
        {this.desktop()}
        <Form.Checkbox
          name="web"
          label="Использовать Web-версию Skype"
          checked={this.state.web || false}
          onChange={this.onCheck}/>
        <div className="randomization">
          Рандомизация от
          <input
            name="min"
            type="number"
            value={this.state.min || 0}
            onChange={this.onChange}/>
          до
          <input
            name="max"
            type="number"
            value={this.state.max || 0}
            onChange={this.onChange}/>
          миллисекунд
        </div>
        <Form.Checkbox
          name="check"
          label="Проверить логин и пароль"
          checked={this.state.check || !this.props.params.id}
          onChange={this.onCheck}/>
        <Button type="submit">{this.props.params.id ? 'Сохранить' : 'Добавить'}</Button>
      </Form>
    </Segment>
  }
}
