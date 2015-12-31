export default function Noty(type, text){
  window.noty ? window.noty({
    layout: 'topRight',
    theme: 'relax',
    type: type, //alert, warning, success, error, infomation
    text: text,
    animation: {
        open: 'animated bounceInRight', // Animate.css class names
        close: 'animated bounceOutRight', // Animate.css class names
        // easing: 'swing', // unavailable - no need
        // speed: 500 // unavailable - no need
    }
  })
  : alert(text);
}