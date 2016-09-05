  import React, { PropTypes } from 'react';
  import Styler from 'react-styling';

  export default class SearchList extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        show: false,
        value: props.value,
        error: false,
      }
      this.show = this.show.bind(this);
      this.hide = this.hide.bind(this);
      this.onChange = this.onChange.bind(this);
      this.onChoose = this.onChoose.bind(this);
    }
    show(){
      if(this.props.disabled){ return; }
      this.setState({show: true, error: false});
      $('body').on('click', this.hide);
    }
    hide(){
      setTimeout(() => {
        this.setState({
          show: false,
          error: !this.props.value || (this.props.value && this.props.value != this.state.value)
        });
        $('body').off('click', this.hide);
      })
    }
    onChange(e){
      this.setState({value: e.target.value});
    }
    onChoose(info, e){
      this.setState({
        value: info.text,
        show: false,
      });
      this.props.onChoose(info);
    }
    componentWillUnmount(){
      $(this.refs.wrapper).off('click');
    }
    render(){
      
      var value = this.state.value.replace(/(\s)|('(.)*)|("(.)*)$/, '');
      var filter_list = this.props.data.filter(n => n.text.indexOf(value) != -1);
      filter_list = filter_list.length ? filter_list : this.props.data;

      var content = filter_list.map((n, i) => (
        <li className="item" key={n.id} onClick={this.onChoose.bind(this, n)}>
          <a className="text-ellipsis" href="javascript:;">{n.text}</a>
        </li>
      ))
      var styles = Styler`
        ul {
          width: 100%;
          font-size: 12px;
          max-height: 200px;
          overflow: auto;
          display: ${this.state.show ? 'block' : 'none'}
        }
      `;
      return (
        <div
          ref="wrapper"
          className={`inline-block relative ${this.state.error ? 'has-error' : ''}`}
          style={this.props.wrapperStyle}>
          <input
            ref="input"
            type="text"
            onClick={this.show}
            onChange={this.onChange}
            className="input-xs form-control"
            value={this.state.value}
            disabled={this.props.disabled}
            placeholder={this.props.placeholder}
          />
          <ul className="dropdown-menu" style={styles.ul}>
            { content.length ? content : <div className="text-center">无</div> }
          </ul>
        </div>
      );
    }
  };

  SearchList.defaultProps = {
    placeholder: '',
    data: [],
    onChoose: function(){ alert('请给SearchList组件指定onChoose回调'); },
  }