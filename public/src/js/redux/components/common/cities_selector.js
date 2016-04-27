import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Tooltip from 'common/tooltip2';

import actions from 'actions/cities_selector';

const IconCheckBox = props => (
  <i className={"fa fa-fw " + (props.checked ? "fa-check-square-o" : "fa-square-o")} {...props}/>
);

const Panel = props => (<div className="panel" {...props} />);

const Button = props => (
  <button className={"btn btn-xs btn-" + (props.active ? 'warning' : 'default')} style={{margin:'0 3px 3px 0'}} {...props}>{props.children}</button>
);

const disableProps = {style:{color:'#ccc', cursor: 'not-allowed'}, onClick: undefined};

class Selector extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const { props } = this;
    const state = props.citiesSelector;

    return (
      <div>
        <Panel>
          <div className="panel-heading">
            搜索城市
            <span className="pull-right label label-default">
              {(state.provincesData.get(state.selectedProvince) || {}).name}
            </span>
          </div>
          <div className="panel-body">
            <div className="row">
              <div className="col-xs-4" style={{height:200,overflow:'scroll'}}>
                <div className="btn-group-vertical btn-group-xs btn-block">
                  {
                    [...state.provincesData.values()].map(({ id, name, enable }) => (
                      <p key={id}>
                        <IconCheckBox
                          disabled={!enable}
                          checked={state.checkedProvinces.has(id)}
                          onClick={props.toggleProvinceCheckStatus.bind(undefined, id)}
                          {...enable ? {} : disableProps}
                        />
                        <a
                          href="javascript:;"
                          disabled={!enable}
                          className="text-muted"
                          onClick={props.changeSelectedProvince.bind(undefined, id)}
                          {...enable ? {} : disableProps}
                        >
                          {' '}{name}
                        </a>
                        { state.selectedProvince === id ? (<i className="fa fa-arrow-circle-left fa-fw" />) : null }
                      </p>
                    ))
                  }
                </div>
              </div>
              <div className="col-xs-8" style={{height:200,overflow:'scroll'}}>
                {
                  state.provincesData.has(state.selectedProvince) ? [...state.provincesData.get(state.selectedProvince).list].map(id => {
                    const city = state.citiesData.get(id);
                    return (
                      <Button
                        key={id}
                        disabled={!city.enable}
                        active={state.checkedCities.has(id) || state.checkedProvinces.has(city.province)}
                        onClick={props.toggleCityCheckStatus.bind(undefined, id)}
                        {...city.enable ? {} : disableProps}
                      >
                        {city.name}
                      </Button>
                    )
                  }) : null
                }
              </div>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="panel-heading">
            已选城市
            <a href="javascript:;" className="pull-right" onClick={props.unCheckAllCities}><small>清空</small></a>
          </div>
          <div className="panel-body">
            {
              (state.checkedProvinces.size === 0 && (state.checkedCities.size === 0))
              ? '您未选择任何城市'
              : [...state.checkedCities].map(id => (
                <Tooltip msg="删除" key={id}>
                  <Button
                    onClick={props.toggleCityCheckStatus.bind(undefined, id)}
                  >
                    {state.citiesData.get(id).name}
                  </Button>
                </Tooltip>
              ))
            }
          </div>
        </Panel>
      </div>
    );
  }
};

export default Selector;