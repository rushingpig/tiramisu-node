import React from 'react';

var Pagination = React.createClass({
  getDefaultProps: function(){
    return {
      random_btn_active: true,
      random_btn_show: true,
      perpage_count: 20,//每页显示20条
      total_count: 0,
      current_page: 0,
      page_num_show: 10, //分页的页码，显示10个
      onPageChange: null//,
      //onPageChangeBefore: null
    }
  },
  _calc_pages: function(){
    var total_count = this.props.total_count;
    var perpage_count = this.props.perpage_count;
    var current_page = this.props.current_page;

    if (total_count < 0 || total_count == Infinity){
        var total_pages = -1;
    } else {
        var total_pages = Math.ceil(total_count / perpage_count);
    }
    this.total_pages = total_pages;

    //分页的分页~
    var page_num_show = this.props.page_num_show;
    if (total_pages == -1){//Infinity处理
        var pagesOfpage = -1;
    } else {
        var pagesOfpage = Math.ceil(total_pages / page_num_show);
    }
    var cpageOfPage = Math.floor(current_page / page_num_show);
    var long_prev = cpageOfPage > 0;
    var long_next = cpageOfPage < pagesOfpage - 1 || pagesOfpage == -1;

    var page_num_start = cpageOfPage * page_num_show;
    if (total_pages == -1){
        var page_num_end = (cpageOfPage + 1) * page_num_show;
    } else {
        var page_num_end = Math.min((cpageOfPage + 1) * page_num_show, total_pages);
    }

    return {
      "current_page": current_page,
      "total_pages": total_pages,

      "start": page_num_start,
      "end": page_num_end,
      "long_prev": long_prev,
      "long_next": long_next
    };
  },
  _selectPage: function(page){
    // if (this.props.onPageChangeBefore){
    //     this.props.onPageChangeBefore(page);
    // }
    if (this.props.onPageChange){
        this.props.onPageChange(page);
        /*
        this.setState({
            current_page: page
        }, function(){
            this.props.onPageChange(page);
        });
        */
    }
  },
  _prevPage: function(){
    if (this.props.current_page > 0){
        this._selectPage(this.props.current_page - 1);
    }
  },
  _nextPage: function(){
    var total_pages = this.total_pages;
    if (total_pages == -1  || this.props.current_page < total_pages-1){
        this._selectPage(this.props.current_page + 1);
    }
  },
  _longJumpPre: function(){
    var pn = this.props.page_num_show;
    var page = Math.floor(this.props.current_page / pn) * pn - 1;
    this._selectPage(page);
  },
  _longJumpNext: function(){
    var pn = this.props.page_num_show;
    var page = Math.floor(this.props.current_page / pn + 1) * pn;
    this._selectPage(page);
  },
  render: function(){
    var page_info = this._calc_pages();
    var total_pages = page_info.total_pages;

    var preDisabledCls = page_info.current_page > 0 ? "" : " disabled",
        nextDisabledCls = (total_pages==-1 || page_info.current_page < total_pages-1) ? "" : " disabled";

    var longNextStyle = {display: 'none'},
        longPreStyle = {display: 'none'};
    if (page_info.long_next){
        longNextStyle = {};
    }
    if (page_info.long_prev) {
        longPreStyle = {};
    }

    var lastPageStyle = longNextStyle;
    if (total_pages == -1){ //无穷大的页码就不能显示最后一页按钮
        lastPageStyle = {display: 'none'}
    }

    var page_numbers = [];
    for(var n = page_info.start; n < page_info.end && this.props.random_btn_show; n++){
        var actived = n == page_info.current_page;
        var classnames = 'paginate_button';
        if (this.props.random_btn_active) {
             classnames += actived ? ' active' : '';
            page_numbers.push(
                <li className={classnames} onClick={this._selectPage.bind(this, n)} key={n}>
                    <a href="javascript:;">{n+1}</a>
                </li>
            );
        } else {
            if (actived){
                classnames += " active";
            } else {
                classnames += " disabled";
            }
            page_numbers.push(
                <li className={classnames} key={n}>
                    <a href="javascript:;">{n+1}</a>
                </li>
            );
        }
    }

    var firstPage, longJumpPre, lastPage, longJumpNext;
    if (this.props.random_btn_show){
        //TODO random_btn_active

      firstPage =
        <li className="paginate_button" style={longPreStyle} onClick={this._selectPage.bind(this, 0)}>
          <a href="javascript:;">首页</a>
        </li>;
      longJumpPre =
        <li className="paginate_button" style={longPreStyle} onClick={this._longJumpPre}>
          <a href="javascript:;">...</a>
        </li>;

      lastPage =
          <li className="paginate_button" style={lastPageStyle} onClick={this._selectPage.bind(this, total_pages-1)}>
              <a href="javascript:;">末页</a>
          </li>;
      longJumpNext =
        <li className="paginate_button" style={longNextStyle} onClick={this._longJumpNext}>
          <a href="javascript:;">...</a>
        </li>;
    }


  return (
    <div className="clearfix" style={{"padding": "0 20px"}}>
      <ul className="pagination pull-right">
        <li className={'paginate_button previous'+preDisabledCls} onClick={this._prevPage}>
            <a href="javascript:;">«</a>
        </li>

        {firstPage}
        {longJumpPre}

        {page_numbers}

        {longJumpNext}
        {lastPage}

        <li className={'paginate_button next'+nextDisabledCls} onClick={this._nextPage}>
            <a href="javascript:;">»</a>
        </li>
      </ul>
      <div style={{'lineHeight': '31px', 'marginRight': '15px'}}>
        {'共' + this.props.total_count + '项'}
      </div>
    </div>
    )
  }
});

export default Pagination;