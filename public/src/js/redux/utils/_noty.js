export default function Noty(type, text){
  var timeout = {
    success: 2500,
    alert: 3500,
    warning: 4000,
  }
  window.noty ? window.noty({
    layout: 'topRight',
    theme: 'relax',
    type: type, //alert, warning, success, error, information
    text: text,
    animation: {
        open: 'animated bounceInRight', // Animate.css class names
        close: 'animated bounceOutRight', // Animate.css class names
        // easing: 'swing', // unavailable - no need
        // speed: 500 // unavailable - no need
    },
    timeout: timeout[type] || false
  })
  : alert(text);
}