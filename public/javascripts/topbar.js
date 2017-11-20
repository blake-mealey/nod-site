$(document).ready(function() {
    $('.username').mouseenter(function() {
        $(this).addClass('username-selected');
    });
    $('.username').mouseleave(function() {
        if (!$(this).hasClass('username-open')) {
            $(this).removeClass('username-selected');
        }
    });
    $('.username').click(function() {
        if ($(this).hasClass('username-open')) {
            $(this).removeClass('username-open');
            $(this).removeClass('username-selected');
        } else {
            $(this).addClass('username-open');
            $(this).addClass('username-selected');
        }
    });
});