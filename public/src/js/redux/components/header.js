import React, {Component} from 'react';
import {dateFormat} from 'utils/index';
import cookie from 'utils/cookie';
import history from 'history_instance';
import { NAV_COLLAPSED_CLASS, NAV_COLLAPSED_COOKIE, 
  NAV_COLLAPSED_COOKIE_NO, NAV_COLLAPSED_COOKIE_YES } from 'config/app.config';

class Header extends Component {
  constructor(props){
    super(props);
    var now = new Date();
    var { user } = window.xfxb;
    if( typeof user == 'string' ){
      user = JSON.parse(user);
    }
    this.state = {
      usermenu_open: false,
      time: dateFormat(new Date()),
      day: now.getDay(),
      weekday: ['日', '一', '二', '三', '四', '五', '六'],
      user: user || {}
    };
  }
  render(){
    return (
      <div className="header-section">
        <a className="toggle-btn menu-collapsed" onClick={this.handleNavCollapse}><i className="fa fa-bars"></i></a>
        <div className="menu-right">
          <ul className="notification-menu" id="notification-menu">
            <li className="timer">
              {this.state.time + '  星期' + this.state.weekday[this.state.day]}
            </li>
            <li className={this.state.usermenu_open ? 'open' : ''}>
              <a href="javascript:;" className="btn btn-default dropdown-toggle"
                  onClick={this.toggleUserMenu.bind(this)} data-toggle="dropdown" aria-expanded="false">
                {/*<img src="http://www.qq1234.org/uploads/allimg/141119/2252043613-8.png" alt="" />*/}
                { this.state.user.name || '--'}
                <span className="caret"></span>
              </a>
              <ul className="dropdown-menu dropdown-menu-usermenu pull-right">
                <li><a href="javascript:;"><i className="fa fa-user"></i>  个人</a></li>
                <li><a href="javascript:;" onClick={this.alterPsd.bind(this)}><i className="fa fa-cog"></i>  修改密码</a></li>
                <li><a href="javascript:;" onClick={this.logout.bind(this)}><i className="fa fa-sign-out"></i> 退出</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  handleNavCollapse(){
    var $app = $('#app-container');
    var c = NAV_COLLAPSED_CLASS;
    if($app.hasClass(c)){
      $app.removeClass(c);
      cookie.set(NAV_COLLAPSED_COOKIE, NAV_COLLAPSED_COOKIE_NO);
    }else{
      $app.addClass(c);
      $app.find('.sub-menu-list').each(function(){
        this.style.display = '';
      });
      cookie.set(NAV_COLLAPSED_COOKIE, NAV_COLLAPSED_COOKIE_YES);
    }
  }
  toggleUserMenu(){
    this.setState({
      usermenu_open: !this.state.usermenu_open
    }, function(){
      var self = this;
      if(this.state.usermenu_open){
        $('body').on('click', function hideUserMenu(){
          self.setState({ usermenu_open: false });
          $('body').off('click', hideUserMenu);
        })
      }
    })
  }
  hideUserMenu(){
    this.setState({ usermenu_open: false })
  }
  alterPsd(){
    history.push('/cm/account');
  }
  logout(){
    location.href="/logout";
  }
  componentDidMount(){
    this.timer = setInterval(()=>{
      var now = new Date();
      if(now.getDay() != this.state.day){
        this.setState({
          time: dateFormat(now),
          day: now.getDay()
        });
      }
    }, 500);
  }
}

export default Header;