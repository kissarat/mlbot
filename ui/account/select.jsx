import AccountManager from '../../account-manager/index.jsx'
import React, {Component} from 'react'
import Skype from '../../skype/index.jsx'
import {Select, Icon, Message} from 'semantic-ui-react'

export default class SelectAccount extends Component {
  state = {
    accounts: [],
    busy: false
  }

  async componentDidMount() {
    const accounts = await AccountManager.getList()
    this.setState({accounts})
  }

  onChange = async(e, {value}) => {
    const account = await AccountManager.get(value)
    this.props.select(account)
  }

  options() {
    return this.state.accounts.map(({id}) => ({
      key: id,
      value: id,
      text: id,
    }))
  }

  async refresh() {
    this.setState({busy: true})
    const account = await AccountManager.get(this.props.value)
    try {
      await AccountManager.refresh(account.id)
      account.closeWebSkype()
    }
    catch (ex) {
      console.error(ex)
      let content
      switch (ex.kind) {
        case 'abuse':
          content = 'Ваш аккаунт заблокирован'
          break
        case 'confirm':
          content = `Ваш Skype-аккаунт нуждается в проверке.
            Откройте ваше Skype-приложения и подтвердите его с помощью email или SMS`
          break
        case 'password':
          content = 'Неверный пароль'
          break
        default:
          content = ex.toString()
          if ('[object Object]' === content) {
            content = 'Неопределенная ошибка'
          }
          break
      }
      this.setState({
        alert: {
          error: true,
          content,
          onDismiss: () => this.setState({alert: false})
        }
      })
      account.closeWebSkype(true)
    }
    this.setState({busy: false})
  }

  refreshButton() {
    return <Icon
      name="refresh"
      loading={this.state.busy}
      size="big"
      title="Обновить список контактов"
      disabled={!this.props.value}
      onClick={() => this.refresh()}/>
  }

  render() {
    return <div className="widget select-account">
      {this.state.alert ? <Message {...this.state.alert} /> : ''}
      <div>
        <Select
          id="select-skype"
          name="account"
          onChange={this.onChange}
          options={this.options()}
          placeholder="Выберите Skype"
          value={this.props.value}
        />
        {this.props.refresh ? this.refreshButton() : ''}
      </div>
    </div>
  }
}
