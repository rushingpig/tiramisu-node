import React, { Component } from 'react';

/***
 *
 * Bootstrap 下拉菜单组件 React 版
 *
 * 可用属性
 *
 * list [Array]
 *   列表选项，每一个元素为Object，由id, text, checked, disabled四个键组成，
 *   text为显示的项目名称
 *   checked为检查项，当值为true时，显示一个绿色对号
 *   disabled表示是否禁用该选项，当值为true时，选项依旧会显示，但无法被选中
 *
 * onChange [Function]
 *   返回list里被选中的id
 *
 * value [Number]
 *   被选中的list的元素ID，如果该属性存在，则无论选择哪个选项，都会显示id为value的选项。但不改变onChange的返回值
 *
***/

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
      selected: 0,
    };

    this.handleToggleShowState = this.handleToggleShowState.bind(this);
    this.handleClickAnchor     = this.handleClickAnchor.bind(this);
    this.handleClickOutSide    = this.handleClickOutSide.bind(this);
  }

  componentWillMount() {
    this.setState({
      selected: this.props.list[0] ? this.props.list[0].id : 0
    });
  }

  render() {

    let selectedItem = {id: 0, name: "undefined", text: '--请选择--', checked: false, disabled: false};
    let { list } = this.props;

    for (let i in list) {
      if (list[i].id === ('value' in this.props ? this.props.value : this.state.selected)) {
        selectedItem = list[i];
        break;
      }
    }

    return (
      <div className={"btn-group" + (this.state.showList ? ' open' : '') + ' ' + this.props.className}>
        <button type="button" className="btn btn-default btn-xs dropdown-toggle" onClick={this.handleToggleShowState}>
          {selectedItem.text}
          {' '}
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          {
            list.map(option => (
              <li key={option.id}>
                <Anchor disabled={option.disabled} data-id={option.id} onClick={this.handleClickAnchor}>
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
    this.clickInSide = false;
    window.addEventListener('click', this.handleClickOutSide);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleClickOutSide);
  }

  handleToggleShowState() {
    this.clickInSide = true;

    this.setState({
      showList: !this.state.showList
    });
  }

  handleClickAnchor(event) {
    const id = Number(event.currentTarget.dataset.id);

    this.props.onChange(id);
    this.handleToggleShowState(event);

    this.setState({
      selected: id
    });
  }

  handleClickOutSide() {
    if (this.clickInSide) {
      this.clickInSide = false
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