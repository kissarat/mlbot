export default class Search extends Component {
  render() {
    <div className="control">
      <Input
        icon="search"
        onChange={this.onSearch}
        size="small"
        type="search"
        className="search"
        value={this.state.search}
      />
      {this.props.children}
    </div>
  }
}