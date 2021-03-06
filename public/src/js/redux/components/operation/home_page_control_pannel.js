/**
 * 官网首页运营控制
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Styler from 'react-styling';
import clone from 'clone';
import history from 'history_instance';

import { Confirm } from 'common/message_box';
import DropDownMenu from 'common/dropdown';
import AddressSelector from 'common/address_selector';
import StdModal from 'common/std_modal';
import Breadcrumb from 'common/breadcrumb';
import SearchInput from 'common/search_input';
import { normalLoader, get_loading_icon } from 'common/loading';
import { Radio, Row, Col, FormGroup, FormInlineGroup, 
  ProDetailImgsTip, EditImgBox, SelectImgModal } from '../product/sku_website_management';

import getTopHeader from '../top_header';
import LazyLoad from 'utils/lazy_load';
import Config from 'config/app.config';
import { Noty, map, dom, delay } from 'utils/index';

import AreaActions from 'actions/area';
import * as ImgActions from 'actions/central_image_manage';
import * as Actions from 'actions/operation_home_page_control';
import { onFormChange } from 'actions/common';

const TopHeader = getTopHeader(
  [{
    name: '运营管理',
    link: ''
  }, {
    name: '首页运营控制',
    link: '/opm/hpc'
  }]
);

const ApplicationRange = props => {
  return (
    <div 
      className="panel"
      style={{boxShadow: 'none', border: '1px solid #F3F3F3', marginBottom: 22}}
    >
      <div className="panel-body" style={{paddingTop: 12}}>
        <FormGroup>
          <label className="strong">应用范围：</label>
          <label className="ml-20">
            <Radio
              name="city"
              checked={props.all}
              onChange={props.actions.setApplicationRange.bind(undefined, true)}
            />
            &nbsp;全部一致
          </label>
          <label className="ml-20">
            <Radio
              name="city"
              checked={!props.all}
              onChange={props.actions.setApplicationRange.bind(undefined, false)}
            />
            &nbsp;独立城市配置
          </label>
        </FormGroup>
        {
          !props.all
            ? <FormGroup>
                <label className="strong">配置城市：</label>
                <DropDownMenu
                  value={props.province_id}
                  className="ml-20 space-right"
                  list={props.provinces}
                  onChange={props.actions.selectProvince.bind(undefined)}
                />
                <DropDownMenu
                  value={props.city_id}
                  className="space-right"
                  list={props.cities}
                  onChange={props.actions.selectCity}
                />
                <button
                  onClick={props.actions.cacheInfo}
                  disabled={!props.city_id || props.has_cached || !props.submitable}
                  className="btn btn-xs btn-theme"
                  >
                  {props.has_cached ? '已缓存' : '保存城市配置'}
                </button>
                {props.has_cached ? null : <span>（暂存当前城市设置）</span>}
              </FormGroup>
            : null
        }
      </div>
    </div>
  )
}

const EditImgBoxPlus = props => (
  <div style={{marginBottom: 18, outline: props.active ? '4px dashed #E6C36B' : ''}} onClick={props.src && props.onSelect} >
    <EditImgBox {...props} />
  </div>
)

class EditLink extends Component {
  render(){
    var { props } = this;
    return (
      <div ref="editPart" className="panel">
        <div className="panel-body ">
          <FormInlineGroup>
            <label className="v-top">选择图片：</label>
            <div className="inline-block">
              <img src={props.domain + props.banners[props.selected_index].img_key} width="150" />
              <h6>建议尺寸：1920x985</h6>
            </div>
          </FormInlineGroup>
          <FormInlineGroup>
            <label className="v-top">对应链接：</label>
            <textarea
              cols="40"
              style={{padding: 6}}
              className="form-control"
              onChange={props.actions.onFormChange.bind(null, 'banner_link')}
              value={props.banners[props.selected_index].link}
            ></textarea>
          </FormInlineGroup>
        </div>
      </div>
    )
  }
  componentDidMount(){
    delay(() => {
      this.closeFixHandler = dom.fixed({dom: this.refs.editPart, offsetTop: 60})
    });
  }
  componentWillUnmount(){
    this.closeFixHandler();
  }
}

//首页轮播图
class BannerImgs extends Component {
  render(){
    var { props } = this;
    var banner_list = props.banners.map( (n, i) => (
      <EditImgBoxPlus
        key={i}
        active={i == props.selected_index}
        src={n.img_key ? (props.domain + n.img_key) : ''}
        defaultSrc="images/banner.jpg"
        onSelect={props.actions.selectBanner.bind(null, i)}
        onChooseImg={props.showSelectImgModal.bind(null, i)}
        onDeleteImg={props.actions.deleteImg.bind(null, i)}
        >
        <ProDetailImgsTip size="1920x985" />
      </EditImgBoxPlus>
    ))
    return (
      <div className="panel">
        <header className="panel-heading theme">
          首页轮播图
          <span className="font-sm">（2~5张）</span>
        </header>
        <div className="panel-body">
          <Row>
            <Col size="8">
              { banner_list }
              <div className="text-center relative" style={{zIndex: 100}}>
                <button
                  disabled={banner_list.length >= 5}
                  onClick={props.actions.addBanner.bind(null)}
                  className="btn btn-sm btn-default"
                >
                  <i className="fa fa-plus"></i>
                  {' 再添加一张'}
                </button>
              </div>
            </Col>
            <Col size="4">
              {
                props.selected_index != -1
                  ? <EditLink {...props} />
                  : null
              }
            </Col>
          </Row>
          <div className="text-right">
            <button
              data-submitting={props.submitting}
              disabled={!props.submitable}
              onClick={props.submitHandler}
              className="btn btn-lg btn-theme"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.showSelectImgModal = this.showSelectImgModal.bind(this);
    this.submit = this.submit.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.beforeLeave = this.beforeLeave.bind(this);
  }
  render() {
    const { props } = this;
    const { area, actions, imgActions, main, imgList } = props;
    return (
      <div className="wrapper">

        <TopHeader />

        <ApplicationRange
          {...main}
          actions={actions}
          cacheInfo={this.cacheInfo}
        />

        <BannerImgs
          {...main}
          actions={actions}
          domain={imgList.domain}
          submitHandler={this.onSubmit}
          showSelectImgModal={this.showSelectImgModal}
        />

        <SelectImgModal
          ref="selectImgModal"
          {...imgList}
          actions={{...imgActions, selectImg: actions.selectImg}}
        />

      </div>
    );
  }
  componentWillMount(){
    history.registerTransitionHook(this.beforeLeave);
  }
  beforeLeave(location, callback){
    if(this.props.main.cached.length){
      Confirm('您还有暂存的数据没有保存，确认离开吗？')
        .done(() => {
          history.unregisterTransitionHook(this.beforeLeave)
          callback();
        });
    }else{
      callback();
    }
  }
  componentDidMount() {
    this.props.actions.getConfigureData();
    LazyLoad('noty');
    // LazyLoad('qiniu_dev');
    // LazyLoad('qiniu');
  }
  componentWillUnmount(){
    history.unregisterTransitionHook(this.beforeLeave);
  }
  showSelectImgModal(which) {
    //which用以区分是添加哪里的图片
    this.refs.selectImgModal.show(which);
  }

  submit(){
    const { actions, main: {all, city_id, has_cached, submitable, banners, all_cities, cached} } = this.props;
    const transform = ({img_key, link}) => ({src: img_key, url: link});
    if(all){ //全部一致
      return actions.submitEdit([{
        regionalism_ids: all_cities,
        datas: banners.map(transform)
      }])
    }else{ //独立城市配置
      if(city_id && !has_cached && submitable){ //当前未暂存的也可以保存了
        cached.push({ city_id, datas: banners });
      }
      return actions.submitEdit(
        cached.map( ({city_id, datas}) => ({
          regionalism_ids: [city_id],
          datas: datas.map(transform)
        }))
      )
    }
  }
  onSubmit(){
    const { props } = this;
    if(props.main.submitable){
      this.submit()
        .done(() => {
          Noty('success', '保存成功！');
          props.actions.getConfigureData(); //刷新数据
        })
        .fail(msg => Noty('error', msg || '提交出错！'))
    }else{
      Noty('warning', '请确认所有内容已设置完毕！')
    }
  }
}

export default connect(
  ({ operationHomePageControl }) => ({
    ...operationHomePageControl,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...AreaActions(),
      ...Actions,
      onFormChange
    }, dispatch),
    imgActions: bindActionCreators(ImgActions, dispatch)
  })
)(Main);