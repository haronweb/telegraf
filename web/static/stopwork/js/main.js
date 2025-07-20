$(document).ready(function () {

  $('.faq__main-header').click(function(){
      $(this).toggleClass('active');
      $(this).next().slideToggle();
  });

  $('.faq__header').click(function(){
    $(this).toggleClass('active');
    $(this).next().slideToggle();
})
});
