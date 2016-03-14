var MyMap = function(){
  this.callback = null;
  this.d = $.Deferred();
  this.map = null;
  this.init_flag = 0;
}

MyMap.prototype._initialize = function() {
  var container = document.createElement('div');
  container.style.display = 'none';
  var id = 'bmap' + new Date().getTime();
  container.setAttribute('id', id);
  document.body.appendChild(container);
  this.map = new BMap.Map(id);
  this.d.resolve(this.map);
};
   
MyMap.prototype.create = function(callback) {
  if(this == window){
    throw new Error('create调用错误，maybe you should be call the method like this: MyMap.create(this)');
  }
  if(!this.init_flag){
    this.init_flag = 1;
    window._bmap_callback = this._initialize.bind(this);

    var script = document.createElement("script");
    script.src = "http://api.map.baidu.com/api?v=2.0&ak=dxF5GZW6CHlR4GCQ9kKynOcc&callback=_bmap_callback";//此为v2.0版本的引用方式  
    // http://api.map.baidu.com/api?v=1.4&ak=您的密钥&callback=initialize"; //此为v1.4版本及以前版本的引用方式  
    document.body.appendChild(script);
  }
  this.d.done(callback);
}

export default new MyMap();