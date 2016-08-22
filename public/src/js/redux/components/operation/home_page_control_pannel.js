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
import { Noty, map } from 'utils/index';

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
  const hasCached = props.cached.some(n => n.city_id == props.city_id);
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
                  onChange={(value) => {props.actions.selectCity(value);props.getProductInfo(value)}}
                />
                <button
                  onClick={props.cacheInfo}
                  disabled={!props.city_id || hasCached}
                  className="btn btn-xs btn-theme"
                  >
                  {hasCached ? '已缓存' : '保存城市配置'}
                </button>
                {hasCached ? null : <span>（暂存当前城市设置）</span>}
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

//首页轮播图
class BannerImgs extends Component {
  selected_index
  
  render(){
    var { props } = this;
    var banner_list = props.banners.map( (n, i) => (
      <EditImgBoxPlus
        key={i}
        src={n.img_key}
        active={i == props.selected_index}
        defaultSrc="images/banner.jpg"
        onSelect={props.actions.selectBanner.bind(null, i)}
        // onChooseImg={props.showSelectImgModal.bind(null, 'prodetail_img_100001')}
        // onDeleteImg={actions.deleteImg.bind(null, 'prodetail_img_100001')}
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
              <div className="text-center">
                <button className="btn btn-sm btn-default">
                  <i className="fa fa-plus"></i>
                  {' 再添加一张'}
                </button>
              </div>
            </Col>
            <Col size="4">
              {
                props.selected_index != -1
                  ? <div className="panel">
                      <div className="panel-body ">
                        <FormInlineGroup>
                          <label className="v-top">选择图片：</label>
                          <div className="inline-block">
                            <img src={Config.root + "images/banner.jpg"} width="150" />
                            <h6>建议尺寸：1920x985</h6>
                          </div>
                        </FormInlineGroup>
                        <FormInlineGroup>
                          <label className="v-top">对应链接：</label>
                          <textarea className="form-control" cols="40"></textarea>
                        </FormInlineGroup>
                      </div>
                    </div>
                  : null
              }
            </Col>
          </Row>
          <div className="text-right">
            <button className="btn btn-lg btn-theme">保存</button>
          </div>
        </div>
      </div>
    )
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    // this.showSelectImgModal = this.showSelectImgModal.bind(this);
    // this.submit = this.submit.bind(this);
    // this.onSubmit = this.onSubmit.bind(this);
    // this.getInfo = this.getInfo.bind(this);
    // this.cacheInfo = this.cacheInfo.bind(this);
    // this.getProductInfo = this.getProductInfo.bind(this);
    // this.beforeLeave = this.beforeLeave.bind(this);
  }
  render() {
    const { props } = this;
    const { area, actions, imgActions, main, imgList } = props;
    // const disableSubmit = (!applicationRange.all && !applicationRange.city_id) || !props.prolistDetail.ok || !props.proProperties.ok || !props.proIntro.ok || !props.proDetailImgs.ok;
    return (
      <div className="wrapper">
        <TopHeader />

        <ApplicationRange
          {...main}
          actions={actions}
          cacheInfo={this.cacheInfo}
          getProductInfo={this.getProductInfo}
        />

        <BannerImgs {...main}  actions={actions} />

        {/*<SelectImgModal
                  ref="selectImgModal"
                  {...{...imgModal, ...imgList}}
                  actions={{...imgActions, selectImg: actions.selectImg}}
                />*/}
      </div>
    );
  }
  componentWillMount(){
    history.registerTransitionHook(this.beforeLeave);
  }
  beforeLeave(location, callback){
    if(this.props.cached.length){
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
  // getProductInfo(city_id){
  //   var product_id = this.props.params.productId;
  //   var regionalism_id = city_id || this.props.applicationRange.city_id;
  //   if(!product_id || !regionalism_id){
  //     Noty('error', '页面有错误！'); return;
  //   }
  //   if(this.__getProInfoReques){
  //     this.__getProInfoReques.abort(); //取消上一次数据请求
  //   }
  //   this.__getProInfoReques = this.props.actions.getProductInfo({ product_id, regionalism_id })
  // }
  //转换为提交格式的数据
  getInfo(){
    const { props, props: {
      prolistDetail,
      proProperties,
      proIntro,
      proDetailImgs
    }} = this;
    return {
      consistency: props.applicationRange.all ? 0 : 1, //是否全部一致
      list_img: prolistDetail.list_img,
      list_copy: prolistDetail.list_copy,
      detail_top_copy: proProperties.briefIntro_1,
      detail_template_copy: proProperties.briefIntro_2,
      detail_template_copy_end: proProperties.briefIntro_3,
      spec: clone(proProperties.spec),
      detail_img_1: proIntro.intro_img_1,
      detail_img_2: proIntro.intro_img_2,
      detail_img_3: proIntro.intro_img_3,
      detail_img_4: proIntro.intro_img_4,
      template_data: map(proDetailImgs.template_data, (value, position_id) => ({position_id: +position_id, value}))
    }
  }
  cacheInfo(){
    var { props } = this;
    
  }
  submit(productId){
    const { props } = this;
    var info = this.getInfo();
    if(props.applicationRange.all){ //全部一致
      if(!props.applicationRange.all_edited_cities.length){ //之前不存在已编辑过的城市, 那么就是添加
        return props.actions.submitCreate({
          product_id: productId,
          infos: [{
            regionalism_ids: props.applicationRange.all_available_cities.map(n => n.city_id),
            info
          }]
        })
      }else{  //这里就是编辑(也有新增和修改两种)
        let new_infos = [];
        let modified_infos = [];
        props.applicationRange.all_available_cities.map(n => {
          if(
            props.applicationRange.all_edited_cities.some( m => {
              if(m.city_id == n.city_id){
                modified_infos.push({
                  regionalism_id: n.city_id,
                  detail_id: m.detail_id,
                  ...info
                });
                return true;
              }
              return false;
            })
          ){
            
          }else{
            new_infos.push({
              regionalism_id: n.city_id,
              ...info
            });
          }
        })
        return props.actions.submitEdit({
          product_id: productId,
          new_infos,
          modified_infos
        })
      }
    }else{ //独立城市配置
      let new_infos = [];
      let modified_infos = [];
      [
        ...props.applicationRange.cached,
        props.applicationRange.city_id && 
        !props.applicationRange.cached.some( n => n.regionalism_id == props.applicationRange.city_id) && //当前没有加入缓存的城市
        {
          regionalism_id: props.applicationRange.city_id,
          ...info,
          ...(props.applicationRange.product_info ? {detail_id : props.applicationRange.product_info.id} : {})
        }
      ].forEach(n => {
        if(!n) return;
        if(props.applicationRange.all_edited_cities.some( m => m.city_id == n.regionalism_id)){
          modified_infos.push(n);
        }else{
          new_infos.push(n);
        }
      })
      return props.actions.submitEdit({
        product_id: productId,
        new_infos,
        modified_infos,
      })
    }
  }
  onSubmit(){
    const { props } = this;
    const { params: {productId} } = props;
    if(!productId){
      Noty('error', '产品数据有误，无法提交');
    }
    if(
      props.prolistDetail.ok &
      props.proProperties.ok &
      props.proIntro.ok &
      props.proDetailImgs.ok
    ){
      this.submit(+productId)
        .done(() => {
          Noty('success', '保存成功！');
          props.actions.getAllAvailableCities(productId); //刷新数据
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