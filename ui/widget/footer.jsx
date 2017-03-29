import BrowserLink from '../widget/browser-link.jsx'
import config from '../../app/config'
import Persistence from '../../util/persistence.jsx'
import React, {PureComponent} from 'react'
import {Grid, Image, Icon} from 'semantic-ui-react'

export default class Footer extends PureComponent {
  name = 'Footer'
  persist = ['visible']

  constructor() {
    super()
    this.state = Persistence.register(this, {
      visible: true
    })
  }

  render() {
    const className = (this.state.visible ? 'expanded' : 'collapsed') + ' widget footer'
    return <footer className={className}>
      <Grid className="advertise">
        <Grid.Row columns={2}>
          <Grid.Column>
            {'club-leader' === config.vendor ? <Image src="images/logo-leader.png"/> : ''}
            <Image src="images/logo-inbisoft.png"/>
          </Grid.Column>
          <Grid.Column className="logos">
            <div className="copyright">&copy; 2017 Все права защищены.</div>
            <div className="inbisoft">
              MLBot принадлежит IT-компании&nbsp;
              <BrowserLink href="http://inbisoft.com/">«INBISOFT»</BrowserLink>.
            </div>
            {'club-leader' === config.vendor
              ? <p>
                MLBot Skype разработан для поддержки участников&nbsp;
                <BrowserLink href="https://club-leader.com/">«CLUB LEADER»</BrowserLink>
                &nbsp;от компании «BEST CHOICE»
              </p>
              : <div>
                <div>Разрабатываем МЛМ-проекты, программы и сервисы.</div>
                <BrowserLink href="http://inbisoft.com/magazin/">
                  <Icon name="shop" />
                  Магазин
                </BrowserLink>&nbsp;
                <BrowserLink href="http://inbisoft.com/kontakty/">
                  <Icon name="chat" />
                  Связаться с Inbisoft
                </BrowserLink>
              </div>}
            <BrowserLink href="https://join.skype.com/osF3PAzKHnc9">
              <Icon name="skype" size="big"/>
              Чат Skype-поддержки
            </BrowserLink>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <div className="control">
        <Icon name="chevron up"
              size="large"
              onClick={() => this.setState({visible: true})}/>
        <Icon name="close"
              size="large"
              onClick={() => this.setState({visible: false})}/>
      </div>
    </footer>
  }
}
