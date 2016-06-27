import React, { Component, PropTypes } from 'react';

class ProgressBar extends Component {
  render(){
    var { theme, type, persent } = this.props;
    if(persent == 100){
      theme = 'success';
    }
    return (
      <div className={`progress progress-${type} active progress-sm`}>
        <div style={{width: persent + '%'}} className={`progress-bar progress-bar-${theme}`}>
          <span className="persent">{persent}%</span>
        </div>
      </div>
    )
  }
}

ProgressBar.defaultProps = {
  persent: 0,
  theme: 'theme',
  type: 'striped',
};

ProgressBar.propTypes = {
  persent: PropTypes.number.isRequired,
  theme: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
}

export default ProgressBar;