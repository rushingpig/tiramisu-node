import { core } from 'utils/index';
import Promise from 'utils/promise';

var root = window.xfxb.root;
var config = {
  noty: {
    css: '/plugins/animate/animate.min.css',
    js: root + 'lib/jquery.noty.packaged.min.js',
  },
  chinese_py: {
    js: root + 'lib/chinese_py.min.js'
  },
  autocomplete: {
    css: '/plugins/jquery-ui/jquery-ui.css',
    js: '/plugins/jquery-ui/autocomplete.js',
  },
  GeoUtils: {
    js: root + 'lib/GeoUtils.min.js',
  },
  datetimerangepicker: {
    css: '/node_modules/react-bootstrap-datetimerange-picker/dist/react-bootstrap-datetime-range-picker.css'
  },
  fileupload: {
    js: '/plugins/upload/jquery.fileupload.min.js'
  },
  dropzone: {
    js: '/plugins/upload/dropzone.min.js'
  },
  qiniu: {
    js: [
      '/plugins/plupload/full.min.js',
      '/plugins/qiniu/qiniu.min.js'
    ]
  },
  qiniu_dev: {
    js: [
      '/plugins/plupload/moxie.js',
      '/plugins/plupload/plupload.dev.js',
      '/plugins/qiniu/qiniu.js'
    ]
  },
};
var load_map = {};

var createScript = function(jsSrc){
  return new Promise(function(resolve, reject){
    var sc = document.createElement("script");
    sc.type = "text\/javascript";
    sc.src = jsSrc;
    sc.onload = function(){
      resolve();
    };
    document.body.appendChild(sc);
  })
};

export default function LazyLoad(name, callback){
  $(function(){
    var plugin = config[name];
    if(plugin){
      if(!load_map[name]){
        if( load_map[name] != 0 ){
          if(plugin.css){
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = plugin.css;
            document.head.appendChild(link);
          }
          if(core.isString(plugin.js)){
            createScript(plugin.js).done(() => {
              load_map[name] = 1; //加载成功
              callback && callback();
            })
          }else if(core.isArray(plugin.js)){
            setTimeout(function(){
              plugin.js
                .reduce( (prev, next) => prev.pipe( () => createScript(next) ), $.Deferred().resolve())
                .done(() => {
                  load_map[name] = 1; //加载成功
                  callback && callback();
                });
            }, 0);
          }
        }
        load_map[name] = 0; //还在加载中
      }else if(callback){
        callback();
      }
    }else{
      console.error('lazy load "' + name + '" fail');
    }
  })
}

//这是谁干的？
window.LazyLoad = LazyLoad;