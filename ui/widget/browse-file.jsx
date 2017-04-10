import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button} from 'semantic-ui-react'

export default class BrowseFile extends Component {
  static propTypes = {
    setText: PropTypes.func
  }

  state = {
    busy: false
  }

  load(file) {
    if (file) {
      this.setState({busy: true})
      const reader = new FileReader()
      reader.onload = e => {
        this.setState({busy: false})
        this.props.setText(e.target.result)
      }
      reader.readAsText(file)
    }
    else {
      console.warn('No file choose')
    }
  }

  render() {
    return <div className="widget browse-file">
      <input
        style={{display: 'none'}}
        name="file"
        type="file"
        ref="file"
        onChange={e => this.load(e.target.files[0])}/>
      <Button
        loading={this.state.busy}
        type="button"
        className="open-file"
        onClick={() => this.refs.file.click()}
        content="Загрузите файл c контактами"
        icon="file text outline"/>
    </div>
  }
}