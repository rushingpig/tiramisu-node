import React, {Component} from 'react';
import { findDOMNode } from 'react-dom';
import nav_config from 'config/nav.config';
import Util from 'utils/index';
import {Link} from 'react-router';
import history from 'history_instance';

class Nav extends Component {
  render(){
    var current_path = location.pathname;
    var V = this.props.onRender; //权限验证函数
    var check_active = function(link, path){
      return link == path || path.startsWith(link); //页面子页面（没在导航菜单中显示的）
    };
    var treeDOM = nav_config.map(firstLevelItem => {
      var active;
      if (Util.core.isArray(firstLevelItem.link)) { //有二级菜单
        let secondLevels = firstLevelItem.link.map(secondLevelItem => {
          let _active = check_active(secondLevelItem.link, current_path);
          active = active || _active;
          if( V( secondLevelItem.key ) ){
            return (
              <li key={secondLevelItem.key} className={_active ? 'active' : ''}>
                <Link to={secondLevelItem.link} className="menu-2">
                    {secondLevelItem.name}
                </Link>
              </li>
            );
          }
        })
        //当secondLevels当中全为undefined时，则表示该栏目下的所有页面均无访问权限，那么就隐藏该栏目
        return secondLevels.some( sl => sl ) && (
          <li key={firstLevelItem.key} className={"menu-list has-sub " + (active ? 'active open' : '')}>
            <a className="menu-1" href="javascript:;">
              <span>{firstLevelItem.name}</span>
            </a>
            <a className="menu-1 short-menu" href="javascript:;">
              {firstLevelItem.short_name}
            </a>
            <ul className="sub-menu-list">{secondLevels}</ul>
          </li>
        )
      } else { //只有一级菜单
        return (
          <li key={firstLevelItem.key} className={check_active(firstLevelItem.link, current_path) ? 'menu-list active open' : 'menu-list'}>
            <Link to={firstLevelItem.link} className="menu-1">
              {firstLevelItem.name}
            </Link>
            <Link to={firstLevelItem.link} className="menu-1 short-menu">
              {firstLevelItem.short_name}
            </Link>
          </li>
        );
      }
    });

    return (
      <nav id="nav">
        <ul className='nav'>{treeDOM}</ul>
      </nav>
    )
  }

  componentDidMount(){
    var $nav = $('.left-side');
    var SLIDE_TIME = 180;

    $nav.on('click', 'a.menu-1', function(){
      if(!$('#app-container').hasClass('left-side-collapsed')){
        var $menulist = $(this).parents('.menu-list').eq(0);
        $menulist
          .siblings('.open').each(function(){
            var $others = $(this);
            $others.find('.sub-menu-list')
              .slideToggle(SLIDE_TIME, function(){
                $others.removeClass('open')
              });
          })
        $menulist
          .find('.sub-menu-list')
            .slideToggle(SLIDE_TIME, function(){
              $menulist.toggleClass('open')
            });
      }
    }).on('click', 'a.menu-2', function(){
      var $this = $(this), $li = $this.parent(), $menulist = $this.parents('.menu-list').eq(0);
      $li.addClass('active');
      $menulist.addClass('active').removeClass('on-hover');
    });

    $nav
      .find('.menu-list').each(function(){
        $(this).on('mouseenter', function(){
          $(this).addClass('on-hover');
        }).on('mouseleave', function(){
          $(this).removeClass('on-hover');
        });
      });
  }

  componentWillUnmount(){
    var $nav = $('.left-side');
    $nav.off('click').find('.menu-list').each(function(){
      $(this).off('click');
    });
  }
}

Nav.defaultProps = {
  //默认情况，始终返回true, 代表不做权限控制
  onRender: function( role ){
    return true;
  }
}

export default Nav;