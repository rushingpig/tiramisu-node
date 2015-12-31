
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

export default {
    get_normal_loading: function(){
        return normal_loading(loading_icon);
    },
    get_table_loading: function(){
        return table_loading(loading_icon);
    },

    get_normal_empty: function(){
        return normal_loading(empty_icon);
    },
    get_table_empty: function(){
        return table_loading(empty_icon);
    },

    get_loading_icon: function(){
        return loading_icon;
    },
    get_empty_icon: function(){
        return empty_icon;
    },
    get_refresh_icon: function(){
        return refresh_icon;
    },
};
