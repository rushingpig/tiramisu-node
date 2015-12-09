import React, {Component} from 'react';
import config from '../config/nav_config';
import Util from '../utils/index';

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

    var treeDOM = config.map(firstLevelItem => {
        // var activeThis = this.state.activeLink && this.state.activeLink.firstLevel === (firstLevelItem && firstLevelItem.key);

      if (Util.core.isArray(firstLevelItem.link)) { //有二级菜单
        let secondLevels = firstLevelItem.link.map(secondLevelItem => {
            // let activeThis = (secondLevelItem && secondLevelItem.key) === (this.state.activeLink && this.state.activeLink.secondLevel);
            return (
              <li key={secondLevelItem.key}>
                <a href={secondLevelItem.link} className="">
                    {secondLevelItem.name}
                </a>
              </li>
            );
        })
        // .filter(function(d) {
        //     return d !== false;
        // });

        // if (this.props.smallSider || activeThis)
        //     ulStyle.height = 38 * secondLevels.length;

        return (
          <li key={firstLevelItem.key} className="menu-list">
            <a href="#">
              <i className={`fa fa-${firstLevelItem.icon}`} />
              {firstLevelItem.name}
            </a>
            <ul className="sub-menu-list">{secondLevels}</ul>
          </li>
        )
      } else { //只有一级菜单
        return (
          <li key={firstLevelItem.key} className="menu-list">
            <a href={firstLevelItem.link}>
              <i className={`fa fa-${firstLevelItem.icon}`} />
              {firstLevelItem.name}
            </a>
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