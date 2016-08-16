/**
 * 商品对应对应官网上的内容设置
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
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

import getTopHeader from '../top_header';
import LazyLoad from 'utils/lazy_load';
import Config from 'config/app.config';
import { Noty, map } from 'utils/index';

import AreaActions from 'actions/area';
import * as Actions from 'actions/product_sku_website_manage';
import * as ImgActions from 'actions/central_image_manage';
import { onFormChange } from 'actions/common';

const FormGroup = props => (<div className="form-group" {...props} />);
const FormInlineGroup = props => (<div className="form-group form-inline" {...props} />);
const Input = props => (<input type="number" className="form-control input-xs" {...props} />);
const CheckBox = props => (<input type="checkbox" {...props} />);
const Radio = props => (<input type="radio" {...props} />);
const Row = props => (<div className="row" {...props} />);
const Col = props => <div {...props} className={`col-xs-${props.size} ${props.className}`} />;
const Title = props => <p style={{fontWeight: 'normal'}} {...props} />;
const outline = '1px solid #eee';

class Panel extends Component {
  constructor(props){
    super(props);
    this.state = {
      open: true,
    }
    this.onToggle = this.onToggle.bind(this);
  }
  render(){
    var {open} = this.state;
    var headerStyle = {fontWeight: 'normal'};
    !open && (headerStyle.borderBottom = 'none');
    var { props } = this;
    return (
      <div 
        className="panel"
        style={{boxShadow: 'none', border: '1px solid #F3F3F3', marginBottom: 22}}
      >
        <header className="panel-heading" style={headerStyle}>
          <span className="theme">{props.title}</span>
          <a href="javascript:;" onClick={this.onToggle} className="pull-right" style={{marginTop: 3}}>
            <i className={`fa ${open ? 'fa-chevron-circle-up' : 'fa-edit'}`}></i>
          </a>
        </header>
        {
          open
            ? <div className="panel-body" style={{paddingTop: 12}}>
                {props.children}
                <div className="form-group clearfix">
                  <button
                    disabled={props.ok}
                    className={`btn btn-sm btn-${props.ok ? 'default' : 'theme'} pull-right`}
                    onClick={props.onConfirm}
                  >
                    {props.ok ? <i className="fa fa-check theme"></i> : '确认'}
                  </button>
                </div>
              </div>
            : null
        }
      </div>
    )
  }
  onToggle(){
    this.setState({open: !this.state.open})
  }
}

const ColBox = props => <div {...props} style={{...props.style, width: props.width || 300}} className="text-center pull-left relative" />;

class Img extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading: false,
    }
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.src && nextProps.src != this.props.src){
      this.setState({ loading: true });
    }
  }
  render(){
    var { props } = this;
    var grayStyle = Styler`
      -webkit-filter: grayscale(100%);
      opacity: .4;
    `;
    if(props.src){
      grayStyle.opacity = 0;
    }
    return (
      <div position="relative">
        <img
          alt="img"
          width="100%"
          // height="100%"
          src={Config.root + props.defaultSrc}
          style={grayStyle}
        />
        {
          props.src
            ? <img
                alt="img"
                width="100%"
                src={props.src}
                className="absolute"
                style={{top: 0, left: 0}}
                onLoad={this.onLoad.bind(this)}
              />
            : null
        }
        {
          this.state.loading
            ? <div style={{zIndex: 100}} className="center theme">{get_loading_icon()}</div>
            : null
        }
      </div>
    )
  }
  onLoad(){
    this.setState({ loading: false })
  }
}

const AddButton = props => (<i className="fa fa-plus center text-center cursor-pointer hover-effect" style={{
  fontSize: 16,
  width: 38,
  height: 38,
  lineHeight: '38px',
  background: 'rgba(216, 150, 69, 0.8)',
  boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
  color: '#fff',
  borderRadius: '50%',
}} {...props}></i>)

class EditImgBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      showEditIcon: false
    }
  }
  render(){
    var { props, props: {src} } = this;
    var opStyle = {
      top: 8,
      right: 8,
      background: 'rgba(255, 255, 255, 0.69)',
      padding: '0 3px',
      borderRadius: '2px'
    }
    return (
      <div onMouseEnter={this.toggleEditIcon.bind(this, true)}
        onMouseLeave={this.toggleEditIcon.bind(this, false)}
        className={'relative ' + props.className}
        style={{outline, verticalAlign: 'top', ...props.style}}
      >
        <Img src={props.src} defaultSrc={props.defaultSrc || "images/products/pro-list-1.jpg"} />
        {
          src
            ? this.state.showEditIcon 
                ? <div className="absolute" style={opStyle}>
                    <a onClick={props.onDeleteImg} href="javascript:;" className="space-right"><i className="fa fa-trash-o"></i></a>
                    <a onClick={props.onChooseImg} href="javascript:;"><i className="fa fa-edit"></i></a>
                  </div>
                : null
            : [
                <AddButton key="addBtn" onClick={this.props.onChooseImg} />,
                props.children
              ]
        }
      </div>
    )
  }
  toggleEditIcon(show){
    if(this.props.src){
      this.setState({ showEditIcon: show })
    }
  }
}

const TopHeader = getTopHeader(
  [{
    name: '产品管理',
    link: ''
  }, {
    name: '搜索商品',
    link: '/pm/sku_manage'
  }, {
    name: '商品官网设置',
    link: ''
  }]
);

//(1)
const ApplicationRange = props => {
  const hasCached = props.cached.some(n => n.regionalism_id == props.city_id);
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

const ProlistImgBox = props => <div className="relative inline-block" {...props} style={{width: 245, height: 245, outline, ...props.style}} />

const ContentEditBox = props => {
  var styles = Styler`
    main {
      background: #fff;
      border: 1px solid #DAD8D8;
      border-radius: 4px;
      font-size: 12px;
      line-height: 19px;
    }
    textareaStyle {
      position: absolute;
      width: 100%;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 1;
      background: transparent;
      outline: 0;
      border: none;
      resize: none;
      padding: ${props.style.padding}
    }
    tipsStyle {
      position: absolute;
      bottom: -4px;
      right: 3px;
    }
  `;
  return (
    <div {...props} style={{...props.style, ...styles.main}}>
      <textarea
        value={props.content}
        onChange={props.onContentChange}
        className="text-left" style={styles.textareaStyle}
        maxLength={props.contentMaxLength}
        >
      </textarea>
      <div style={{color: '#D0C7C7', opacity: +!props.content.length }}>
        <div>
          {props.placeholder}
        </div>
      </div>
      {
        props.contentMaxLength
          ? <p className="theme v-mg text-right" style={styles.tipsStyle}>{props.contentMaxLength}字以内</p>
          : null
      }
    </div>
  )
}

//(2)
//产品列表信息展示
class ProlistDetail extends Component {
  componentWillMount(){
    this.styles = Styler`
      contentStyle {
        width: 100%;
        position: absolute;
        padding: 18px 5px 24px;
        top: 50%;
        transform: translateY(-50%);
      }
    `
  }
  render(){
    var { props, props: { actions } } = this;
    var img_src = props.list_img && (props.domain + props.list_img);
    return (
      <Panel
        title="分类页面信息展示"
        ok={props.ok}
        onConfirm={actions.confirmThisPart.bind(null, 'ProlistDetail')}
      >
        <div className="clearfix relative">
          <ColBox>
            <Title>1.商品图（展示在商品分类页面商品缩略图）</Title>
            <ProlistImgBox>
              <EditImgBox
                src={img_src}
                defaultSrc="images/products/pro-list-1.jpg"
                onChooseImg={props.showSelectImgModal.bind(undefined, 'prolist_img')}
                onDeleteImg={actions.deleteImg.bind(null, 'prolist_img')}
              />
            </ProlistImgBox>
            <p className="v-mg">建议尺寸：245 x 245 像素</p>
          </ColBox>
          <ColBox>
            <Title>2.商品简介1（展示在商品分类页面描述文案）</Title>
            <ProlistImgBox>
              <Img src={img_src} defaultSrc="images/products/pro-list-1.jpg" />
              <ContentEditBox
                contentMaxLength={35}
                content={props.list_copy}
                style={this.styles.contentStyle}
                onContentChange={actions.onFormChange.bind(undefined, 'prolist_desc')}
                placeholder='"芒果茫茫 + 榴莲香雪 + 提拉米苏 + 黑森林"，一次让您品尝四种不同口味！' />
            </ProlistImgBox>
          </ColBox>
        </div>
      </Panel>
    )
  }

}

//(3)
//产品详情页缩略展示图
class ProIntro extends Component {
  render(){
    var imgW = 80;
    var { props, props: { actions } } = this;
    var ok = props.intro_img_1 && props.intro_img_2 && props.intro_img_3 && props.intro_img_4;
    var showList = [1, 2, 3, 4].map( n => 
      <img
        key={n}
        alt={n}
        src={`http://placehold.it/${imgW}${ok ? '/ccc/A58F68' : ''}?text=${props['intro_img_' + n] ? '✓' : '图1'}`}
        style={{marginRight: 4}}
      />
    )
    var list = [1, 2, 3, 4].map( n => 
      <EditImgBox
        key={n}
        className="inline-block"
        style={{margin: '0 50px 30px 0', width: 180, height: 180}}
        src={props['intro_img_' + n] ? (props.domain + props['intro_img_' + n]) : ''}
        defaultSrc="images/products/pro-list-1.jpg"
        onChooseImg={props.showSelectImgModal.bind(null, 'intro_img_' + n)}
        onDeleteImg={actions.deleteImg.bind(null, 'intro_img_' + n)}
      />
    )
    return (
      <Panel title="产品详情页缩略展示图" ok={props.ok} onConfirm={actions.confirmThisPart.bind(null, 'ProIntro')}>
        <div className="clearfix" style={{paddingLeft: 30}}>
          <div className="pull-left">
            <img src={`http://placehold.it/${imgW * 4 + 4 * 3}${ok ? '/ccc/A58F68' : ''}?text=${ok ? '✓' : '主图'}`} alt=""/>
            <div style={{marginTop: 4, marginRight: -4}}>
              { showList }
            </div>
          </div>
          <div className="pull-left" style={{marginLeft: 30}}>
            <p>商品展示图 (推荐尺寸：526 x 526)</p>
            <div className="inline-block" style={{width: 500}}>
              { list }
            </div>
          </div>
        </div>
      </Panel>
    )
  }
}

class FormCol extends Component {
  constructor(props){
    super(props);
    this.state = {
      focus: false,
    }
  }
  render(){
    var { props } = this;
    var label = props.label.split('');
    var str = new Array(props.length).fill('　');
    str.splice(0, label.length, ...label);
    var onChange = props.actions.onSpecItemChange.bind(null, props.label);
    var textareaStyle = props.value && props.value.length > 15
      ? {resize: 'vertical', height: 'auto', lineHeight: '15px'}
      : {resize: 'none', height: 27}
    return (
      !props.editable
        ? <div className="form-group form-inline inline-block" style={{marginRight: 60}}>
            <label><span>{str.join('')}</span>：</label>
            <textarea
              ref="textarea"
              value={props.value}
              onChange={onChange}
              style={textareaStyle}
              className="form-control input-xs long-input"
            ></textarea>
          </div>
        : <div ref="main" className="form-group form-inline inline-block relative" style={{marginRight: 60}}>
            <input
              type="text"
              ref="editInput"
              onChange={props.actions.onFormChange.bind(null, 'editable_key')}
              className="form-control input-xs v-top"
            />
            ：
            <input
              type="text"
              onChange={onChange}
              className="form-control input-xs long-input"
            />
            <div className="absolute" style={{top: 4, right: 4}}>
              <i
                style={{marginRight: 2}}
                onClick={props.actions.excSpecItem.bind(null, 'OK')}
                className="fa fa-check cursor-pointer hover-effect"
              ></i>
              <i
                onClick={props.actions.excSpecItem.bind(null, 'DEL')}
                className="fa fa-times cursor-pointer hover-effect"
              ></i>
            </div>
          </div>
    )
  }
  componentDidMount(){
    if(this.props.editable){
      this.refs.editInput.style.width = $(this.refs.main).prev().find('label span').width() + 'px';
    }
  }
}

//(4)
//产品详情页相关属性
class ProProperties extends Component {
  constructor(props){
    super(props);
    this.state = {
      placeholder_2: `
        /每个女生的心中都有一个公主梦//梦想着有一天穿上心爱的水晶鞋遇上命中的白马王子//幸福快乐地生活在一起//
        每个人对幸福都有着不同的理解//但都逃不过一种甜蜜的感觉/
        /四重奏蛋糕//入口即化的顺滑+独特香味的口感+口齿留香的回味+甜而不腻的享受//一次性让你体验四种不同的幸福感觉/
      `,
    }
  }
  render(){
    var { props, props: { actions } } = this;
    var spec_max_length = Math.max(...props.spec.map( n => n.editable ? 0 : n.key.length ));
    var spec_list = props.spec.map( (n, i) =>
      <FormCol
        key={i}
        label={n.key}
        value={n.value}
        actions={actions}
        editable={n.editable}
        length={spec_max_length}
      />
    );
    return (
      <Panel title="商品详情页相关属性" ok={props.ok} onConfirm={actions.confirmThisPart.bind(null, 'ProProperties')}>
        <div className="clearfix relative">
          <ColBox>
            <Title>商品简介2（商品详情页面顶部商品描述）</Title>
            <ProlistImgBox style={{outline: 'none', height: 'auto'}}>
              <ContentEditBox
                className="relative"
                style={{padding: '5px 5px 21px'}}
                contentMaxLength={35}
                content={props.briefIntro_1}
                onContentChange={actions.onFormChange.bind(null, 'briefIntro_1')}
                placeholder='"芒果茫茫 + 榴莲香雪 + 提拉米苏 + 黑森林"，一次让您品尝四种不同口味！'
              />
            </ProlistImgBox>
          </ColBox>
          <ColBox width="500" style={{marginLeft: 23}}>
            <Title className="text-left">商品简介3（商品详情页面图片描述上方的包装文案及结束标题）</Title>
            <ContentEditBox
              className="relative"
              style={{padding: '10px 5px'}}
              content={props.briefIntro_2}
              onContentChange={actions.onFormChange.bind(null, 'briefIntro_2')}
              placeholder={this.state.placeholder_2}
            />
            <ContentEditBox
              className="relative"
              style={{padding: '10px 5px', marginTop: 20}}
              content={props.briefIntro_3}
              onContentChange={actions.onFormChange.bind(this, 'briefIntro_3')}
              placeholder="/四重奏/"
            />
          </ColBox>
        </div>
        <hr/>
        <div style={{paddingLeft: 30}}>
          <div className="mg-8">
            <Title className="inline-block">产品原材料</Title>
            <span>(展示在商品分类页面，非必填项，其中一项不填则该描述不显示在页面)</span>
            <button
              disabled={props.spec.some( n => n.editable )}
              onClick={actions.excSpecItem.bind(null, 'ADD')}
              className="btn btn-xs btn-default space-left">
              <i className="fa fa-plus"></i>{' 添加'}
            </button>
          </div>
          <div style={{width: 1100}}>
            {spec_list}
          </div>
        </div>
      </Panel>
    )
  }
  onContentChange(key, e){
    this.setState({ [key]: e.target.value });
  }
}

const ProDetailImgsTip = props => (
    <div className="center theme" style={Styler`
      margin-top: 37px;
      background: rgba(230, 195, 141, 0.48);
      padding: 2px 7px;
      border-radius: 3px;
      box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.25);
    `}>建议尺寸：{props.size} 像素</div>
)

//(5)
class ProDetailImgs extends Component {
  render(){
    var w = 700;
    var space = 16;
    var w_2 = (w - space)/2;
    var { props, props: { actions, template_data } } = this;
    return (
      <Panel title="产品详情页" ok={props.ok} onConfirm={actions.confirmThisPart.bind(null, 'ProDetailImgs')}>
        <div style={{paddingLeft: 30}}>
          <div className="relative" style={{width: w}}>
            <EditImgBox
              src={template_data['100001'] ? (props.domain + template_data['100001']) : ''}
              defaultSrc="images/products/pro-desc-1.jpg"
              onChooseImg={props.showSelectImgModal.bind(null, 'prodetail_img_100001')}
              onDeleteImg={actions.deleteImg.bind(null, 'prodetail_img_100001')}>
              <ProDetailImgsTip size="1120x743" />
            </EditImgBox>
          </div>
          <div className="clearfix" style={{marginTop: space}}>
            <div className="relative pull-left" style={{marginRight: space, width: w_2}}>
              <EditImgBox
                src={template_data['100002'] ? (props.domain + template_data['100002']) : ''}
                defaultSrc="images/products/pro-desc-2-1.jpg"
                onChooseImg={props.showSelectImgModal.bind(null, 'prodetail_img_100002')}
                onDeleteImg={actions.deleteImg.bind(null, 'prodetail_img_100002')}>
                <ProDetailImgsTip size="547x547" />
              </EditImgBox>
            </div>
            <div className="relative pull-left" style={{width: w_2}}>
              <EditImgBox
                src={template_data['100003'] ? (props.domain + template_data['100003']) : ''}
                defaultSrc="images/products/pro-desc-2-2.jpg"
                onChooseImg={props.showSelectImgModal.bind(null, 'prodetail_img_100003')}
                onDeleteImg={actions.deleteImg.bind(null, 'prodetail_img_100003')}>
                <ProDetailImgsTip size="547x547" />
              </EditImgBox>
            </div>
          </div>
          <div className="relative" style={{marginTop: space, width: w}}>
            <EditImgBox
              src={template_data['100004'] ? (props.domain + template_data['100004']) : ''}
              defaultSrc="images/products/pro-desc-3.jpg"
              onChooseImg={props.showSelectImgModal.bind(null, 'prodetail_img_100004')}
              onDeleteImg={actions.deleteImg.bind(null, 'prodetail_img_100004')}>
              <ProDetailImgsTip size="1120x743" />
            </EditImgBox>
          </div>
        </div>
      </Panel>
    )
  }
}

const tabContentBoxStyle = {
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  border: 'solid 1px #ddd',
  borderTop: 'none',
  boxShadow: 'none'
}
const containerStyle = Styler`
  max-width: 100%;
  min-width: 
  width: calc((100% - 1440px)*40px)
`

class Main extends Component {
  constructor(props) {
    super(props);
    this.showSelectImgModal = this.showSelectImgModal.bind(this);
    this.submit = this.submit.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.cacheInfo = this.cacheInfo.bind(this);
    this.getProductInfo = this.getProductInfo.bind(this);
    this.beforeLeave = this.beforeLeave.bind(this);
  }
  componentWillMount(){
    
  }
  render() {
    const { props } = this;
    const { params: {productId}, area, applicationRange, actions, imgActions, main, imgModal, imgList } = props;
    const disableSubmit = (!applicationRange.all && !applicationRange.city_id) || !props.prolistDetail.ok || !props.proProperties.ok || !props.proIntro.ok || !props.proDetailImgs.ok;
    return (
      <div className="wrapper">
        <TopHeader />
        <ul className="nav nav-tabs">
          <li>
            <Link to={`/pm/sku_manage/edit/${productId+location.hash}`}>编辑商品</Link>
          </li>
          <li className="active">
            <a href="javascript:;">商品品官网设置</a>
          </li>
        </ul>
        <div className="panel" style={tabContentBoxStyle}>
          <div className="panel-body" style={{paddingTop: 33}}>
              <div id="sku_website_management_container_style" className="-col-lg-9 -col-lg-offset-1">
                <ApplicationRange
                  {...applicationRange}
                  actions={actions}
                  cacheInfo={this.cacheInfo}
                  getProductInfo={this.getProductInfo}
                />
                <ProlistDetail
                  {...props.prolistDetail}
                  actions={actions}
                  domain={imgList.domain}
                  showSelectImgModal={this.showSelectImgModal}
                />
                <ProIntro
                  {...props.proIntro}
                  actions={actions}
                  domain={imgList.domain}
                  showSelectImgModal={this.showSelectImgModal}
                />
                <ProProperties
                  {...props.proProperties}
                  actions={actions}
                />
                <ProDetailImgs
                  {...props.proDetailImgs}
                  actions={actions}
                  domain={imgList.domain}
                  showSelectImgModal={this.showSelectImgModal}
                />

                <div className="mgt-20 text-right">
                  <button
                    onClick={this.onSubmit}
                    disabled={disableSubmit || main.submitting}
                    data-submitting={main.submitting}
                    className="btn btn-lg btn-theme">
                    保存
                  </button>
                </div>
              </div>

          </div>
        </div>
        <SelectImgModal
          ref="selectImgModal"
          {...{...imgModal, ...imgList}}
          actions={{...imgActions, selectImg: actions.selectImg}}
        />
      </div>
    );
  }
  componentWillMount(){
    history.registerTransitionHook(this.beforeLeave);
    var s = document.createElement('style');
    s.setAttribute('media', 'screen and (min-width: 1440px)');
    s.innerHTML = `
      #sku_website_management_container_style {
        margin-left: 8.33333%;
        width: 70%;
      }
    `
    document.head.appendChild(s);
    this._containerStyle = s;
  }
  beforeLeave(location, callback){
    if(this.props.applicationRange.cached.length){
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
    this.props.actions.getAllAvailableCities(this.props.params.productId)
      .done( (provinces, cities) => {
        if(cities[0].has_detailc_cities.length && cities[0].has_detailc_cities.every( n => n.consistency == 0)){
          this.getProductInfo(cities[0].has_detailc_cities[0].regionalism_id);
        }
      })
    LazyLoad('noty');
    // LazyLoad('qiniu_dev');
    // LazyLoad('qiniu');
  }
  componentWillUnmount(){
    history.unregisterTransitionHook(this.beforeLeave);
    document.head.removeChild(this._containerStyle);
  }
  showSelectImgModal(which) {
    //which用以区分是添加哪里的图片
    this.refs.selectImgModal.show(which);
  }
  getProductInfo(city_id){
    var product_id = this.props.params.productId;
    var regionalism_id = city_id || this.props.applicationRange.city_id;
    if(!product_id || !regionalism_id){
      Noty('error', '页面有错误！'); return;
    }
    if(this.__getProInfoReques){
      this.__getProInfoReques.abort(); //取消上一次数据请求
    }
    this.__getProInfoReques = this.props.actions.getProductInfo({ product_id, regionalism_id })
  }
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
    if(
      props.prolistDetail.ok &&
      props.proProperties.ok &&
      props.proIntro.ok &&
      props.proDetailImgs.ok &&
      props.applicationRange.city_id
    ){
      var cacheData = {
        regionalism_id: this.props.applicationRange.city_id,
        ...this.getInfo()
      };
      if(props.applicationRange.product_info_ing){
        Noty('warning', '数据加载中，请稍后！');
        return;
      }else{
        if(props.applicationRange.product_info){
          cacheData.detail_id = props.applicationRange.product_info.id;
        }
      }
      this.props.actions.cacheInfo(cacheData);
    }else if(!props.applicationRange.city_id){
      Noty('warning', '请选择城市')
    }else{
      Noty('warning', '请确认以下编辑内容！')
    }
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
  ({ productSKUWebsiteManagement }) => ({
    ...productSKUWebsiteManagement,
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

const FolderBox = props => (
  <div className="pull-left text-center cursor-pointer"
    style={{width: 100, margin: '0 15px 15px'}}
    onClick={props.enterDir.bind(undefined, props)}
    >
    <div className="relative" style={{width: 100,height: 100}}>
      <img src={Config.root + "images/folder.png"} style={{width: '78%'}} className="center" />
    </div>
    <h6 className="text-ellpisis">{props.name}</h6>
  </div>
)

const ImgViewBoxStyle = Styler`
  pxStyle {
    color: #fff;
    position: absolute;
    bottom: -20px;
    width: 100%;
    background: rgba(0,0,0,.7);
    height: 20px;
    line-height: 20px;
    transition: all .25s;
  }
`
class ImgViewBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      px: '读取中...',
    }
  }
  render(){
    var {props} = this;
    var style = {
      width: 100,
      margin: '0 15px 15px',
      outline: props.viewImg && props.viewImg.id == props.id
        ? '3px solid rgb(232, 207, 169)'
        : 'none'
    };
    return (
      <div
        style={style}
        className="pull-left text-center cursor-pointer"
        onMouseEnter={this.togglePxInfo.bind(this, true)}
        onMouseLeave={this.togglePxInfo.bind(this, false)}
        /*借用一下viewImg代表选中动作*/
        onClick={props.actions.viewImg.bind(undefined, props)}
        >
        <div className="relative" style={{width: 100,height: 100, overflow: 'hidden'}}>
          <img
            ref="img"
            className="center"
            src={props.domain + props.url + '?imageView2/0/w/100/h/100'}
            onLoad={this.onImgLoaded.bind(this)}
            onError={this.onImgError.bind(this)}
          />
          <div ref="pxInfo" style={ImgViewBoxStyle.pxStyle}>{this.state.px}</div>
        </div>
        <h6 className="text-ellipsis">{props.name}</h6>
      </div>
    )
  }
  togglePxInfo(show_or_not){
    this.refs.pxInfo.style.transform = `translateY(${show_or_not ? -100 : 0}%)`;
  }
  onImgLoaded(){
    $.get(this.props.domain + this.props.url + '?imageInfo')
      .done((data) => {
        this.setState({ px: data.width + 'x' + data.height })
      }).fail(this.onImgLoaded.bind(this))
  }
  onImgError(){
    var { img } = this.refs;
    img.onerror = this.onImgError.bind(this);
    img.src = this.props.domain + this.props.url + '?imageView2/0/w/100/h/100';
  }
}
class SelectImgModal extends Component {
  constructor(props){
    super(props);
    this.state = {
      breadcrumb: [{id: undefined, name: '全部文件'}],

    };
    this.enterDir = this.enterDir.bind(this);
  }
  render(){
    var { breadcrumb } = this.state;
    //view_img 用来代表选中的图片
    var { loading, search_ing, list, domain, view_img, actions } = this.props;
    var content = list.map( (n, i) => {
      if(n.isDir){
        return <FolderBox {...n} enterDir={this.enterDir} key={n.id + '' + i} />
      }else if(n.url && n.url.match(/(\.jpg$)|(\.png4)|(\.gif$)|(\.webp$)|(\.tiff$)|(\.bmp$)/)){
        return <ImgViewBox actions={actions} key={n.id + '' + i} {...n} viewImg={view_img} domain={domain} />
      }
    })
    return (
      <StdModal
        ref="modal" 
        title="选择图片"
        size="lg"
        disabled={!view_img}
        /*关闭窗口，同时取消选中*/
        onCancel={this.props.actions.viewImg.bind(undefined, null)}
        onConfirm={this.onConfirm.bind(this)}
      >
        <div className="panel">
          <header className="panel-heading">
            {
              breadcrumb.length > 1
                ? [
                    <span
                      key="return"
                      onClick={this.backToUpperDir.bind(this)}
                      className="achor font-sm"
                    >
                      返回上一级
                    </span>,
                    <span key="sep" className="gray"> | </span>
                  ]
                : null
            }
            <Breadcrumb
              data={breadcrumb}
              className="inline-block"
              onClick={this.onBreadcrumbClicked.bind(this)}
            />
            <SearchInput
              searchHandler={this.search.bind(this)}
              searching={this.props.search_ing}
              className="form-inline pull-right"
              placeholder="图片名称"
            />
          </header>

          <div className="panel-body clearfix">
            { normalLoader(loading, content) }
          </div>
        </div>
      </StdModal>
    )
  }
  componentDidMount() {
    
  }
  show(which){
    this.props.actions.getImageFileList();
    this.setState({ which }, this.refs.modal.show);
  }
  onConfirm(){
    this.props.actions.selectImg(this.props.view_img.url, this.state.which);
    this.refs.modal.hide();
  }
  onBreadcrumbClicked(node){
    var index = this.state.breadcrumb.findIndex( b => b.id == node.id );
    var breadcrumb = this.state.breadcrumb.slice(0, index + 1);
    this.setState({breadcrumb});
    this.props.actions.getImageFileList({parent_id: node.id});
  }
  enterDir({id, name}){
    this.state.breadcrumb.push({id, name});
    this.setState({
      breadcrumb: this.state.breadcrumb
    })
    this.props.actions.getImageFileList({parent_id: id});
  }
  backToUpperDir(){
    var { breadcrumb } = this.state;
    breadcrumb.pop();
    this.setState({ breadcrumb });
    this.props.actions.getImageFileList({parent_id: breadcrumb[breadcrumb.length - 1].id});
  }
  search(value){
    this.props.actions.startSearchImgByNameIng();
    this.props.actions.getImageFileList({parent_id: this.props.dirId, name: value.trim() || undefined})
  }
}