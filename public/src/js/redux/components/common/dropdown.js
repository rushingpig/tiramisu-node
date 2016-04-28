import React, { Component } from 'react';

const Anchor = props => {
  if (props.disabled) {
    return (<a disabled={true} style={{cursor:'not-allowed',color:'#aaa'}} key='disable'>{props.children}</a>);
  }

  return (<a key='enable' href="javascript:;" {...props} />);
}

class DropDownMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showList: false,
      selectedIndex: 0,
    };

    this.handleToggleShowState = this.handleToggleShowState.bind(this);
    this.handleClickAnchor     = this.handleClickAnchor.bind(this);
    this.handleClickOutSide    = this.handleClickOutSide.bind(this);
  }

  render() {
    return (
      <div className={"btn-group" + (this.state.showList ? ' open' : '')}>
        <button type="button" className="btn btn-default btn-xs dropdown-toggle" onClick={this.handleToggleShowState}>
          {this.props.list[this.state.selectedIndex] ? this.props.list[this.state.selectedIndex].text : null}
          {' '}
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          {
            this.props.list.map((option, i) => (
              <li key={option.id}>
                <Anchor disabled={option.disabled} data-index={i} onClick={this.handleClickAnchor}>
                  {option.text}
                  {'　'}
                  <i className={"text-success fa fa-fw" + (option.checked ? ' fa-check' : '')} />
                </Anchor>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }

  componentDidMount() {
    this.clickInside = false;
    window.addEventListener('click', this.handleClickOutSide);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleClickOutSide);
  }

  handleToggleShowState() {
    this.clickInside = true;

    this.setState({
      showList: !this.state.showList
    });
  }

  handleClickAnchor(event) {
    this.handleToggleShowState(event);
    this.props.onChange(this.props.list[event.currentTarget.dataset.index].id);

    this.setState({
      selectedIndex: Number(event.currentTarget.dataset.index)
    });
  }

  handleClickOutSide() {
    if (this.clickInside) {
      this.clickInside = false
      return;
    }

    this.setState({
      showList: false
    });
  }
}

DropDownMenu.defaultProps = {
  list: [],
  onChange: () => undefined
}

export default DropDownMenu;