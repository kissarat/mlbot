import React, {Component} from 'react'
import Footer from '../widget/footer.jsx'

export default class Invalid extends Component {
  render() {
    return <div className="page invalid">
      <h1>Ошибка привязки приложения</h1>
      <div>
        <p>
          Ваше предложение было привязано к другому компьютеру, для того чтобы привьязать
          к этому компьютеру обратитесь в техподдержку
        </p>
      </div>

      <Footer/>
    </div>
  }
}
