import React, { Component, PropTypes } from 'react';

class ProgressBar extends Component {
  render(){
    var { theme, type, percent } = this.props;
    if(percent == 100){
      theme = 'success';
    }
    return (
      <div className={`progress progress-${type} active progress-sm`}>
        <div style={{width: percent + '%'}} className={`progress-bar progress-bar-${theme}`}>
          <span className="percent">{percent}%</span>
        </div>
      </div>
    )
  }
}

ProgressBar.defaultProps = {
  percent: 0,
  theme: 'theme',
  type: 'striped',
};

ProgressBar.propTypes = {
  percent: PropTypes.number.isRequired,
  theme: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
}

export default ProgressBar;