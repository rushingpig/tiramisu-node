$(function(){
  var $nav = $('.left-side');
  $nav.on('click', '.menu-list', function(){
    var d = 180, $t = $(this);
    if(!$t.hasClass('active')){
      $nav.find('.active.menu-list').removeClass('active').find('.sub-menu-list').slideToggle(d);
    }
    $(this).toggleClass('active').find('.sub-menu-list').slideToggle(d);
  });
});
