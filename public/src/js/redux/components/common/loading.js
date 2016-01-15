
var React = require('react');

var loading_icon = <i className="fa fa-spin fa-spinner fa-pulse fa-fw"></i>;
var empty_icon = "无";
var refresh_icon = (
  <div className="box-icon" style={{borderLeft: '1px solid #dbdee0'}}>
    <i className="fa fa-spin fa-refresh" style={{color: '#888', borderLeft: 'none'}}></i>
  </div>
);

var StdWrap = React.createClass({
  render: function(){
    return (
      <div style={{height: "100%",width: "100%", display: "table"}}>
        <div style={{ display: "table-cell", verticalAlign: "middle",textAlign: "center" }}>
          {this.props.children}
        </div>
      </div>
    )
  }
})

var normal_loading = function(content){
  return <StdWrap>{content}</StdWrap>;
};
var table_loading = function(content){
  return (
    <tr>
      <td colSpan="99">
        <StdWrap>{content}</StdWrap>
      </td>
    </tr>
  )
};

export function tableLoader(loading, content){
  return (
    loading 
    ? get_table_loading() 
    : ( content.length ? content : get_table_empty())
  );
}
export function normalLoader(loading, content){
  return (
    loading 
    ? get_normal_loading() 
    : ( content.length ? content : get_normal_empty())
  );
}


export function get_table_loading(){
  return table_loading(loading_icon);
}
export function get_normal_loading(){
  return normal_loading(loading_icon);
}


export function get_table_empty(){
  return table_loading(empty_icon);
}
export function get_normal_empty(){
  return normal_loading(empty_icon);
}


export function get_loading_icon(){
  return loading_icon;
}
export function get_empty_icon(){
  return empty_icon;
}
export function get_refresh_icon(){
  return refresh_icon;
}
