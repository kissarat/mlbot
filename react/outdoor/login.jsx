import React, {Component} from 'react'

export default class Login extends Component {
  render() {
    return <div className="login">
      <header>
        <img src="images/logo-leader.png"/>
        <p>ML Skype AutoBot ™ </p>
      </header>
      <div className="body">
        <div className="column1">
          <form>
            <h1>Войдите</h1>
            <input name="email" type="email" placeholder="Email"/>
            <input name="password" type="password" placeholder="Пароль"/>
            <button type="submit">Войти</button>
          </form>
          <img src="images/logo-leader.png" className="leader-logo"/>
        </div>
        <div className="column1">
          <div className="howuse">
            <h3>Как войти?</h3>
            <p>Для входа используйте почту и пароль проекта</p>
            <p className="site-name"><strong>club-leader.com</strong></p>
            <p>Без покупки программы Silver бот не работает</p>
          </div>
        </div>
        <div className="column1">
          <div className="info">
            <h4>Что это?</h4>
            <p>ML Skype AutoBot — кроссплатфоренный бот-спаммер Skype для Windows, Mac OS, Linux.</p>
            <h4>Возможности:</h4>
            <ul>
              <li>Добавление в друзья;</li>
              <li>Рассылка сообщений.</li>
            </ul>
          </div>
        </div>
      </div>
      <footer>
        <p>© ML Skype Autobot beta v0.1 www.mlautobot.com</p>
      </footer>
    </div>
  }
}
