$(function () {

    //mob menu
    $('.burger').click(function () {
        $('body').toggleClass('active-menu').find('.header-nav, .burger').toggleClass('active');
    });
})