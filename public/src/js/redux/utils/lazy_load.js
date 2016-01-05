var root = window.xfxb.root;
var config = {
  noty: {
    css: 'http://cdn.bootcss.com/animate.css/3.2.3/animate.min.css',
    js: root + 'lib/jquery.noty.packaged.min.js',
  }
};

export default function LazyLoad(name){
  $(function(){
    var plugin = config[name];
    if(plugin){
      setTimeout(function(){
        if(plugin.css){
          $('head').append('<link rel="stylesheet" href="' + plugin.css + '">');
        }
        if(plugin.js){
          $('body').append('<script src="' + plugin.js + '"></script>');
        }
      }, 200);
    }else{
      console.warn('lazy load "' + name + '" fail');
    }
  })
}