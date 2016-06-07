import React, {Component, PropTypes} from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import classNames from 'classnames';

import showMessageBox from 'common/message_box';

import { Noty } from 'utils/index';
import Req from 'utils/request';
import Url from 'config/url';

import getTopHeader from '../top_header';

const TopHeader = getTopHeader([{name: '修改密码', link: ''}]);

const AlterUserPasswordPannel =  React.createClass({
  getInitialState: function() {
    return {
      username: window.xfxb.user.username || '-',
      old_psd: '',
      new_psd: '',
      ensure_new_psd: '',
      submitting: false,
      secret: true,

      old_psd_error: true,
      new_psd_error: true,
      ensure_new_psd_error: true
    };
  },
  render(){
    var { username, old_psd, new_psd, ensure_new_psd, secret, submitting, new_psd_error, ensure_new_psd_error } = this.state;
    return (
      <div>
        <div className="panel">
          <div className="panel-heading">修改密码</div>
          <div className="panel-body" style={{paddingLeft: 20}}>
            <div className="form-group form-inline">
              <label htmlFor="username">用户名：　</label>
              <input value={username} readOnly id="username" type="text" className="form-control input-xs"/>
            </div>
            <div className="form-group form-inline">
              <label htmlFor="old_psd">旧密码：　</label>
              <input value={old_psd} onChange={this.onOldPsdChange} id="old_psd" autoComplete="off" type={secret ? "password" : "text"} className="form-control input-xs"/>
              <a onClick={this.handlePsd} tabIndex="-1" href="javascript:;" style={{position: 'relative', right: 16}}>
                <i className={`fa fa-eye${secret ? '-slash' : ''}`}></i>
              </a>
            </div>
            <div className={classNames('form-group', 'form-inline', {'has-success': !new_psd_error})}>
              <label htmlFor="new_psd">新密码：　</label>
              <input value={new_psd} onChange={this.onNewPsdChange} id="new_psd" autoComplete="off" type={secret ? "password" : "text"} className="form-control input-xs"/>
              { new_psd_error
                ? null
                : <i className="fa fa-check text-success" style={{position: 'relative', right: 16, width: 0}}></i>
              }
              <span className="gray small">（数字或字母且长度不少于6位）</span>
            </div>
            <div className={classNames('form-group', 'form-inline', {'has-success': !ensure_new_psd_error})}>
              <label htmlFor="ensure_new_psd">确认密码：</label>
              <input value={ensure_new_psd} onChange={this.onEnsureNewPsdChange} id="ensure_new_psd" autoComplete="off" type={secret ? "password" : "text"} className="form-control input-xs"/>
              { ensure_new_psd_error
                ? null
                : <i className="fa fa-check text-success" style={{position: 'relative', right: 16}}></i>
              }
            </div>
            <div className="form-group form-inline">
              {'　　　　　'}
              <button className="btn btn-danger btn-xs"
               disabled={submitting} 
               data-submitting={submitting}
               onClick={this.submitHandler}
               style={{width: 50, marginTop: '10px'}}>
                  确认
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  },
  componentDidMount() {
    LazyLoad('noty');
  },
  onOldPsdChange(e){
    var { value } = e.target;
    this.setState({
      old_psd: value,
      old_psd_error: !value
    })
  },
  onNewPsdChange(e){
    var { value } = e.target;
    this.setState({
      new_psd: value,
      new_psd_error: value.length < 6 || !/^[\da-z]{6,}$/i.test(value)
    })
  },
  onEnsureNewPsdChange(e){
    var { value } = e.target;
    this.setState({
      ensure_new_psd: value,
      ensure_new_psd_error: value.length < 6 || !/^[\da-z]{6,}$/i.test(value) || value != this.state.new_psd
    })
  },
  submitHandler(){
    var { username, old_psd, new_psd, ensure_new_psd,
       old_psd_error, new_psd_error, ensure_new_psd_error } = this.state;
    if(old_psd_error){
      Noty('error', '请填写旧密码'); return;
    }else if(new_psd_error){
      Noty('error', '新密码格式错误'); this.setState({ ensure_new_psd: '' }); return;
    }else if(ensure_new_psd_error){
      Noty('error', '确认密码错误'); this.setState({ ensure_new_psd: '' }); return;
    }

    this.setState({ submitting: true });
    Req.put(Url.alter_psd.toString(username), {
      old_password: old_psd,
      new_password: new_psd,
      verify_new_password: ensure_new_psd
    }).done(function(){
      showMessageBox({
        text: '修改密码成功，请重新登录！'
      }).then(function(){
        location.href="/logout";
      })
    }).fail(function(msg){
      Noty('error', msg || '网络繁忙，请稍后再试');
    })
    .always(function(){
      this.setState({ submitting: false })
    }.bind(this))
  },
  handlePsd(){
    this.setState({ secret: !this.state.secret })
  }
});

export default AlterUserPasswordPannel;