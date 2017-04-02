import React, {Component} from 'react'
import Footer from '../widget/footer.jsx'
import {Message} from 'semantic-ui-react'
import package_json from '../../app/package.json'

export default class Unavailable extends Component {
  render() {
    return <div className="page error">
      <h1>MLBot for Skype v{package_json.version}</h1>

      <Message error>
        <pre>{this.props.message}</pre>
      </Message>

      <div className="message">
        <h1>Ошибка! </h1>
        <h2>Последнее сообщение:</h2>
        <h3>
          <i>Хьюстон, что-то не так... Инопланетяни вторглись на нашу планету, их сотни...</i>
          ... хм ... в .. .а ...
          #%$&@^%^$%&@*#$&^%
        </h3>
        <p><strong>Не переживайте! Вскоре мы победим мерзких марсиашек.</strong></p>
        <p>Попробуйте еще раз войти через 5 минут.</p>
      </div>
      <div className="background"></div>

      <Footer/>
    </div>
  }
}
