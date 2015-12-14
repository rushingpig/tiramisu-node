import React, {Component} from 'react';
import nav_config from '../config/nav.config';
import Util from '../utils/index';
import {Link} from 'react-router';

// class MenuItem extend Component {
//   render(){
//     return (
//       <li key={firstLevelItem.key} className="menu-list">
//         <a href="#">
//           <i className={`fa fa-${firstLevelItem.icon}`} />
//           {firstLevelItem.name}
//         </a>
//         {this.props.children}
//       </li>
//     )
//   }
// }

export default class Nav extends Component {
  render(){
    var current_path = location.pathname;
    var treeDOM = nav_config.map(firstLevelItem => {
      var active;
      if (Util.core.isArray(firstLevelItem.link)) { //有二级菜单
        let secondLevels = firstLevelItem.link.map(secondLevelItem => {
            var a = secondLevelItem.link == current_path;
            a && (active = true);
            return (
              <li key={secondLevelItem.key} className={a ? 'active' : ''}>
                <Link to={secondLevelItem.link} className="menu-2">
                    {secondLevelItem.name}
                </Link>
              </li>
            );
        })

        return (
          <li key={firstLevelItem.key} className={"menu-list " + (active ? 'active' : '')}>
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
          <li key={firstLevelItem.key} className="menu-list" className={firstLevelItem.link == current_path ? 'active' : ''}>
            <Link to={firstLevelItem.link} clasName="menu-1">
              {firstLevelItem.name}
            </Link>
            <Link to={firstLevelItem.link} clasName="menu-1 short-menu">
              {firstLevelItem.short_name}
            </Link>
          </li>
        );
      }
    });

    return (
      <nav>
        <ul className='nav'>{treeDOM}</ul>
      </nav>
    )
  }

  componentDidMount(){
    var $nav = $('.left-side');

    $nav.on('click', 'a', function(){
      var $this = $(this), $p = $this.parent(), $menulist = $this.parents('.menu-list').eq(0);

        $menulist
          .siblings('li.active').removeClass('active')
          .find('li.active').remove('active');

      //左侧菜单展开
      if(!$('#app-container').hasClass('left-side-collapsed')){
        // 一级
        if($this.hasClass('menu-1')){
          $p.toggleClass('open').find('.sub-menu-list')
            .slideToggle(180, function(){
              $menulist.addClass('active')
            });
        }
      //左侧菜单收缩
      }else{
        $menulist.addClass('active');
        if($this.hasClass('menu-2')){
          $menulist.removeClass('on-hover');
        }
      }

      $p.addClass('active').siblings('.active').removeClass('active');

    }).find('.menu-list').each(function(){
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