$(function() {
  $("aside").css("left","-300px");

  $("#asideNav").toggle(function() {       
      $('aside').animate({ left: '-25' }, 500);
  }, function() {       
      $('aside').animate({ left: '-300' }, 500);
  });
});

$(function(){
	$('#center').click(function(){
		restartGame();
	});
});