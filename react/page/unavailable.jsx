import React, {Component} from 'react'
import Footer from '../widget/footer.jsx'

export default class Unavailable extends Component {
  render() {
    return <div className="page error">
      <header>
        <img src="images/logo-leader.png"/>
        <p>ML Skype AutoBot ™ </p>
      </header>

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
