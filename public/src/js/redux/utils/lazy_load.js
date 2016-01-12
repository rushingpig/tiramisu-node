var root = window.xfxb.root;
var config = {
  noty: {
    css: 'http://cdn.bootcss.com/animate.css/3.2.3/animate.min.css',
    js: root + 'lib/jquery.noty.packaged.min.js',
  },
  chinese_py: {
    js: root + 'lib/chinese_py.js'
  }
};

export default function LazyLoad(name){
  var load_map = {};
  $(function(){
    var plugin = config[name];
    if(plugin && !load_map[name]){
      setTimeout(function(){
        if(plugin.css){
          $('head').append('<link rel="stylesheet" href="' + plugin.css + '">');
        }
        if(plugin.js){
          $('body').append('<script src="' + plugin.js + '"></script>');
        }
        load_map[name] = 1; //已加载过
      }, 200);
    }else{
      console.warn('lazy load "' + name + '" fail');
    }
  })
}