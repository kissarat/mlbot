import React, {Component} from 'react'
import {Link} from 'react-router'

export default class Menu extends Component {
  static normalize(items, external = false) {
    return items.map(item => item instanceof Array
      ? {name: item[0], url: item[1], external} : item)
  }

  render() {
    const isBreadcrumb = this.props.className && this.props.className.indexOf('breadcrumb') >= 0
    const items = this.props.items.map(function ({name, url, icon, external}) {
      const content = []
      if (icon) {
        content.push(<i key="icon" className={icon}/>)
      }
      content.push(<span key="name">{name}</span>)
      let anchor
      if ('string' === typeof external) {
        anchor = <a href={url} target={external}>{content}</a>
      }
      else if (external) {
        anchor = <a href={url}>{content}</a>
      }
      else {
        anchor = <Link to={url}>{content}</Link>
      }
      return <li className={isBreadcrumb ? 'breadcrumb-item' : ''} key={url}>{anchor}</li>
    })

    return <ul className={'menu widget ' + (this.props.className || '')}>{items}</ul>
  }
}
