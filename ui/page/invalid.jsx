import React, {Component} from 'react'
import Footer from '../widget/footer.jsx'
import {Segment, Message} from 'semantic-ui-react'
import BrowserLink from '../widget/browser-link.jsx'
import api from '../../connect/api.jsx'
import {render} from 'react-dom'

export default class Invalid extends Component {
  render() {
    return <div className="page invalid">
      <Segment>
        <h1>Ошибка привязки приложения</h1>
        <Message
          error
          icon="warning sign"
          content="Ваш аккаунт был привязан к другому компьютеру,
          для того чтобы привьязать к этому компьютеру перейдите по ссылке ниже"/>
        <BrowserLink href={'http://mlbot.inbisoft.com/conflict/' + api.hashToken}>
          Запрос на сброс привьязки
        </BrowserLink>
      </Segment>
      <Footer/>
    </div>
  }

  static render() {
    render(<Invalid/>, document.getElementById('app'))
  }
}
