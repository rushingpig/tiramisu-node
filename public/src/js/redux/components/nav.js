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
              <i className={`fa fa-${firstLevelItem.icon}`} />
              {firstLevelItem.name}
            </a>
            <ul className="sub-menu-list">{secondLevels}</ul>
          </li>
        )
      } else { //只有一级菜单
        return (
          <li key={firstLevelItem.key} className="menu-list" className={firstLevelItem.link == current_path ? 'active' : ''}>
            <Link to={firstLevelItem.link} clasName="menu-1">
              <i className={`fa fa-${firstLevelItem.icon}`} />
              {firstLevelItem.name}
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
}