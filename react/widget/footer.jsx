import React, {Component} from 'react'
import BrowserLink from '../widget/browser-link.jsx'
import {Grid, Image, Icon} from 'semantic-ui-react'

export default class Footer extends Component {
  state = {
    collapsed: localStorage.getItem('footer') ?
      !+localStorage.getItem('footer')
      : false
  }

  setCollapsed(collapsed) {
    localStorage.setItem('footer', collapsed ? '0' : '1')
    this.setState({collapsed})
  }

  render() {
    const className = (this.state.collapsed ? 'collapsed' : 'expanded') + ' widget footer'
    return <footer className={className}>
      <Grid className="advertise">
        <Grid.Row columns={2}>
          <Grid.Column>
            <Image src="images/logo-leader.png"/>
            <Image src="images/logo-inbisoft.png"/>
          </Grid.Column>
          <Grid.Column>
            <div className="copyright">&copy; 2017 Все права защищены.</div>
            <p className="inbisoft">
              MLBot принадлежит IT-компании&nbsp;
              <BrowserLink href="http://inbisoft.com/">«INBISOFT»</BrowserLink>.
            </p>
            <p>
              MLBot Skype разработан для поддержки участников&nbsp;
              <BrowserLink href="https://club-leader.com/">«CLUB LEADER»</BrowserLink>
              &nbsp;от компании «BEST CHOICE»
            </p>
            <BrowserLink href="https://join.skype.com/bcrFbzFEnVzI" target="_blank">
              <Icon name="skype" size="big"/>
              Чат Skype-поддержки
            </BrowserLink>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <div className="control">
        <Icon name="chevron up"
              size="large"
              onClick={() => this.setCollapsed(false)}/>
        <Icon name="close"
              size="large"
              onClick={() => this.setCollapsed(true)}/>
      </div>
    </footer>
  }
}