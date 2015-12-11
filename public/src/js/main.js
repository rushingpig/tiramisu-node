$(function(){
  var $nav = $('.left-side');

  $nav.on('click', 'a', function(){
    var $this = $(this), $p = $this.parent(), $menulist = $this.parents('.menu-list').eq(0);

      $menulist
        .siblings('li.active').removeClass('active')
        .find('li.active').remove('active');

    //左侧菜单展开
    if(!$('#app-container').hasClass('left-side-collapsed')){
      // 一级
      if($this.hasClass('menu-1')){
        $p.toggleClass('open').find('.sub-menu-list')
          .slideToggle(180, function(){
            $menulist.addClass('active')
          });
      }
    //左侧菜单收缩
    }else{
      $menulist.addClass('active');
      if($this.hasClass('menu-2')){
        $menulist.removeClass('on-hover');
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
