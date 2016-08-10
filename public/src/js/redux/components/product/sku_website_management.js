/**
 * 商品对应对应官网上的内容设置
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import Styler from 'react-styling';

import MessageBox, { MessageBoxIcon, MessageBoxType } from 'common/message_box';
import DropDownMenu from 'common/dropdown';
import AddressSelector from 'common/address_selector';

import getTopHeader from '../top_header';
import LazyLoad from 'utils/lazy_load';
import Config from 'config/app.config';

import AreaActions from 'actions/area';
import Actions from 'actions/product_sku_website_manage';

const FormGroup = props => (<div className="form-group" {...props} />);
const FormInlineGroup = props => (<div className="form-group form-inline" {...props} />);
const Input = props => (<input type="number" className="form-control input-xs" {...props} />);
const CheckBox = props => (<input type="checkbox" {...props} />);
const Radio = props => (<input type="radio" {...props} />);
const Row = props => (<div className="row" {...props} />);
const Col = props => <div {...props} className={`col-xs-${props.size} ${props.className}`} />;
const Title = props => <p style={{fontWeight: 'normal'}} {...props} />;
const Panel = props => (
  <div 
    className="panel"
    style={{boxShadow: 'none', border: '1px solid #F3F3F3', marginBottom: 22}}
  >
    {props.header}
    {
      props.open
        ? <div className="panel-body">
            {props.children}
            <div className="form-group clearfix">
              <button className="btn btn-sm btn-theme pull-right">
                确认
              </button>
            </div>
          </div>
        : null
    }
  </div>
)
class FullPanel extends Component {
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
    var panelHeader = (
      <header className="panel-heading" style={headerStyle}>
        <span className="theme">{this.props.title}</span>
        <a href="javascript:;" onClick={this.onToggle} className="pull-right" style={{marginTop: 3}}>
          <i className={`fa ${open ? 'fa-chevron-circle-up' : 'fa-edit'}`}></i>
        </a>
      </header>
    )
    return (
      <Panel header={panelHeader} open={open}>
        {this.props.children}
      </Panel>
    )
  }
  onToggle(){
    this.setState({open: !this.state.open})
  }
}

const ColBox = props => <div {...props} style={{...props.style, width: props.width || 300}} className="text-center pull-left relative" />;

const Img = props => {
  var grayStyle = Styler`
    -webkit-filter: grayscale(100%);
    opacity: .4;
    outline: 1px solid #eee;
  `;
  return (
    <img
      width="100%"
      height="100%"
      alt="img"
      {...props}
      style={!props.src ? {...grayStyle, ...props.style} : null}
      src={props.src || (Config.root + props.defaultSrc)}
    />
  )
}

const AddButton = props => (<i className="fa fa-plus center text-center cursor-pointer hover-effect" style={{
  fontSize: 16,
  width: 38,
  height: 38,
  lineHeight: '38px',
  background: '#D09D5E',
  color: '#fff',
  borderRadius: '50%',
}}></i>)

const TopHeader = getTopHeader([{
  name: '产品管理',
  link: ''
}, {
  name: '搜索商品',
  link: '/pm/sku_manage'
}, {
  name: '商品官网设置',
  link: ''
}]);

const ApplicationRange = props => (
  <Panel open>
    <FormGroup>
      <label className="strong">应用范围：</label>
      <label className="ml-20"><Radio name="city" /> 全部一致</label>
      <label className="ml-20"><Radio name="city" /> 独立城市配置</label>
    </FormGroup>
    <FormGroup>
      <label className="strong">配置城市：</label>
      <AddressSelector className="ml-20" {...props.area} actions={props.actions} />
    </FormGroup>
  </Panel>
)

const ProlistImgBox = props => <div style={{width: 245}} className="relative inline-block" {...props} />

const ContentEditBox = props => {
  var styles = Styler`
    main {
      background: #fff;
      border: 1px solid #eee;
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
      bottom: -2px;
      right: 3px;
    }
  `;
  return (
    <div {...props} style={{...props.style, ...styles.main}}>
      <textarea
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

//产品列表信息展示
class ProlistDetail extends Component {
  constructor(props){
    super(props);
    this.state = {
      content: ''
    }
  }
  componentWillMount(){
    this.styles = Styler`
      contentStyle {
        width: 100%;
        position: absolute;
        padding: 18px 5px;
      }
    `
  }
  render(){
    return (
      <FullPanel title="分类页面信息展示">
        <div className="clearfix relative">
          <ColBox>
            <Title>1.商品图（展示在商品分类页面商品缩略图）</Title>
            <ProlistImgBox>
              <Img defaultSrc="images/products/pro-list-1.jpg" />
              <AddButton />
            </ProlistImgBox>
            <p className="v-mg">建议尺寸：245 x 245 像素</p>
          </ColBox>
          <ColBox>
            <Title>2.商品简介1（展示在商品分类页面描述文案）</Title>
            <ProlistImgBox>
              <Img defaultSrc="images/products/pro-list-1.jpg" />
              <ContentEditBox
                className="center"
                contentMaxLength={35}
                onContentChange={this.onContentChange.bind(this)}
                content={this.state.content}
                style={this.styles.contentStyle}
                placeholder='"芒果茫茫 + 榴莲香雪 + 提拉米苏 + 黑森林"，一次让您品尝四种不同口味！' />
            </ProlistImgBox>
          </ColBox>
        </div>
      </FullPanel>
    )
  }
  onContentChange(e){
    this.setState({ content: e.target.value });
  }
}

const FormCol = ({length = 4,...props}) => {
  var label = props.label.split('');
  var str = new Array(length).fill('　');
  str.splice(0, label.length, ...label);
  return (
    <div className="form-group form-inline inline-block" style={{marginRight: 60}}>
      <label className="v-top">{str.join('')}：</label>
      {
        props.value && props.value.length > 15
          ? <textarea className="form-control input-xs long-input" style={{resize: 'vertical'}}></textarea>
          : <input type="text" className="form-control input-xs long-input"/>
      }
      
    </div>
  )
}
//产品详情页相关属性
class ProProperties extends Component {
  constructor(props){
    super(props);
    this.state = {
      briefIntro_1: '',
      briefIntro_2: '',
      briefIntro_3: '',
      placeholder_2: `
        /每个女生的心中都有一个公主梦//梦想着有一天穿上心爱的水晶鞋遇上命中的白马王子//幸福快乐地生活在一起//
        每个人对幸福都有着不同的理解//但都逃不过一种甜蜜的感觉/
        /四重奏蛋糕//入口即化的顺滑+独特香味的口感+口齿留香的回味+甜而不腻的享受//一次性让你体验四种不同的幸福感觉/
      `,
    }
  }
  componentWillMount(){
    this.styles = Styler`
      
    `
  }
  render(){
    return (
      <FullPanel title="商品详情页相关属性">
        <div className="clearfix relative">
          <ColBox>
            <Title>商品简介2（商品详情页面顶部商品描述）</Title>
            <ProlistImgBox>
              <ContentEditBox
                className="relative"
                style={{padding: '5px 5px 21px'}}
                contentMaxLength={35}
                content={this.state.briefIntro_1}
                onContentChange={this.onContentChange.bind(this, 'briefIntro_1')}
                placeholder='"芒果茫茫 + 榴莲香雪 + 提拉米苏 + 黑森林"，一次让您品尝四种不同口味！'
              />
            </ProlistImgBox>
          </ColBox>
          <ColBox width="500" style={{marginLeft: 23}}>
            <Title className="text-left">商品简介3（商品详情页面图片描述上方的包装文案及结束标题）</Title>
            <ContentEditBox
              className="relative"
              style={{padding: '10px 5px'}}
              content={this.state.briefIntro_2}
              onContentChange={this.onContentChange.bind(this, 'briefIntro_2')}
              placeholder={this.state.placeholder_2}
            />
            <ContentEditBox
              className="relative"
              style={{padding: '10px 5px', marginTop: 20}}
              content={this.state.briefIntro_3}
              onContentChange={this.onContentChange.bind(this, 'briefIntro_3')}
              placeholder="/四重奏/"
            />
          </ColBox>
        </div>
        <hr/>
        <div style={{paddingLeft: 30}}>
          <div className="mg-8">
            <Title className="inline-block">产品原材料</Title>
            <span>(展示在商品分类页面，非必填项，其中一项不填则该描述不显示在页面)</span>
            <button className="btn btn-xs btn-default space-left">
              <i className="fa fa-plus"></i>{' 添加'}
            </button>
          </div>
          <div>
            <FormCol label="蛋糕类型" />
            <FormCol label="口味" />
            <FormCol label="适合人群" />
          </div>
          <div>
            <FormCol label="甜度" />
            <FormCol label="保鲜条件" />
            <FormCol label="原材料" />
          </div>
          <div>
            <div className="form-group form-inline inline-block relative" style={{marginRight: 60}}>
              <input className="form-control input-xs v-top" type="text" style={{width: 52}} />：
              <input type="text" className="form-control input-xs long-input"/>
              <div className="absolute" style={{top: 4, right: 4}}>
                <i className="fa fa-check cursor-pointer hover-effect" style={{marginRight: 2}}></i>
                <i className="fa fa-times cursor-pointer hover-effect"></i>
              </div>
            </div>
          </div>
        </div>
      </FullPanel>
    )
  }
  onContentChange(key, e){
    this.setState({ [key]: e.target.value });
  }
}

class IntroImg extends Component {
  constructor(props){
    super(props);
    this.state = {
      showEditIcon: false
    }
  }
  render(){
    var { src } = this.props;
    return (
      <div onMouseEnter={this.toggleEditIcon.bind(this, true)}
        onMouseLeave={this.toggleEditIcon.bind(this, false)}
        className="inline-block relative"
        style={{marginRight: 50}}
      >
        <Img src={src} defaultSrc="images/products/pro-list-1.jpg" style={{width: 180, height: 180}} />
        {
          src
            ? this.state.showEditIcon 
                ? <a href="javascript:;" className="absolute" style={{top: 10, right: 10}}><i className="fa fa-edit"></i></a>
                : null
            : <AddButton />
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

//产品详情页缩略展示图
class ProIntro extends Component {
  render(){
    var imgW = 80;
    return (
      <FullPanel title="产品详情页缩略展示图">
        <div className="clearfix">
          <div className="pull-left">
            <img src={`http://placehold.it/${imgW * 4 + 4 * 3}?text=主图`} alt=""/>
            <div style={{marginTop: 4}}>
              <img src={`http://placehold.it/${imgW}?text=图1`} style={{marginRight: 4}} alt=""/>
              <img src={`http://placehold.it/${imgW}?text=图2`} style={{marginRight: 4}} alt=""/>
              <img src={`http://placehold.it/${imgW}?text=图3`} style={{marginRight: 4}} alt=""/>
              <img src={`http://placehold.it/${imgW}?text=图4`} alt=""/>
            </div>
          </div>
          <div className="pull-left" style={{marginLeft: 30}}>
            <p>商品展示图 (推荐尺寸：526 x 526)</p>
            <div>
              <IntroImg src="http://placehold.it/180" />
              <IntroImg />
            </div>
            <div style={{marginTop: 30}}>
              <IntroImg />
              <IntroImg />
            </div>
          </div>
        </div>
      </FullPanel>
    )
  }
}

const AddButtonGroup = props => (
  <div>
    <AddButton {...props} />
    <div className="center theme" style={Styler`
      margin-top: 37px;
      background: #D8B886;
      padding: 2px 7px;
      border-radius: 3px;
    `}>建议尺寸：{props.size} 像素</div>
  </div>
)

class ProDetailImgs extends Component {
  render(){
    var w = 700;
    var space = 16;
    var w_2 = (w - space)/2;
    return (
      <FullPanel title="产品详情页">
        <div className="relative" style={{width: w}}>
          <Img defaultSrc="images/products/pro-desc-1.jpg" />
          <AddButtonGroup size="1120x743" />
        </div>
        <div className="clearfix" style={{marginTop: space}}>
          <div className="relative pull-left" style={{marginRight: space, width: w_2}}>
            <Img defaultSrc="images/products/pro-desc-2-1.jpg" />
            <AddButtonGroup size="547x547" />
          </div>
          <div className="relative pull-left" style={{width: w_2}}>
            <Img defaultSrc="images/products/pro-desc-2-2.jpg" />
            <AddButtonGroup size="547x547" />
          </div>
        </div>
        <div className="relative" style={{marginTop: space, width: w}}>
          <Img defaultSrc="images/products/pro-desc-3.jpg" />
          <AddButtonGroup size="1120x743" />
        </div>
      </FullPanel>
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

class Main extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    const { params: {productId}, area, applicationRange, actions } = this.props;

    return (
      <div className="wrapper">
        <TopHeader />
        <ul className="nav nav-tabs">
          <li>
            <Link to={`/pm/sku_manage/edit/${productId}`}>编辑商品</Link>
          </li>
          <li className="active">
            <a href="javascript:;">商品品官网设置</a>
          </li>
        </ul>
        <div className="panel" style={tabContentBoxStyle}>
          <div className="panel-body" style={{paddingTop: 33}}>
            <Row>
              <div className="col-lg-8 col-lg-offset-1">
                <ApplicationRange {...applicationRange} area={area} actions={actions} />
                <ProlistDetail />
                <ProProperties />
                <ProIntro />
                <ProDetailImgs />

                <div className="mgt-20">
                  <button className="btn btn-lg btn-theme">保存</button>
                </div>
              </div>
            </Row>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    
  }

}

export default connect(
  ({ productSKUWebsiteManagement }) => ({
    ...productSKUWebsiteManagement,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...AreaActions(),
      Actions
    }, dispatch),
  })
)(Main);