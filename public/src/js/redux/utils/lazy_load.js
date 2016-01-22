var root = window.xfxb.root;
var config = {
  noty: {
    css: 'http://cdn.bootcss.com/animate.css/3.2.3/animate.min.css',
    js: root + 'lib/jquery.noty.packaged.min.js',
  },
  chinese_py: {
    js: root + 'lib/chinese_py.min.js'
  }
};
var load_map = {};

export default function LazyLoad(name){
  $(function(){
    var plugin = config[name];
    if(plugin){
      if(!load_map[name]){
        setTimeout(function(){
          if(plugin.css){
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = plugin.css;
            document.head.appendChild(link);
          }
          if(plugin.js){
            var sc = document.createElement("script");
            sc.type = "text\/javascript";
            sc.src = plugin.js;
            document.body.appendChild(sc);
          }
          load_map[name] = 1; //已加载过
        }, 0);
      }
    }else{
      console.error('lazy load "' + name + '" fail');
    }
  })
}

window.LazyLoad = LazyLoad;