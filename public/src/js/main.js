$(function(){
  var $nav = $('.left-side');

  $nav.on('click', 'a', function(){
    var $this = $(this), $p = $this.parent();

    $this.parents('.menu-list').eq(0).addClass('active')
      .siblings('li.active').removeClass('active')
      .find('li.active').remove('active');

    //左侧菜单展开
    if(!$('#app-container').hasClass('left-side-collapsed')){
      // 一级
      if($this.hasClass('menu-1')){
        $p.find('.sub-menu-list').slideToggle(180);
      }
    }else{
      if($this.hasClass('menu-2')){
        $this.parents('.menu-list').removeClass('on-hover');
      }
    }

    $p.addClass('active').siblings('.active').removeClass('active');
  }).find('.menu-list').each(function(){
    $(this).on('mouseenter', function(){
      $(this).addClass('on-hover');
    }).on('mouseleave', function(){
      $(this).removeClass('on-hover');
    });
  });
});
