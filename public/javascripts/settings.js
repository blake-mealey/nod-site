$(document).ready(function() {
    $('#upload').click(function() {
        $('#choose-file').click();
    });

    // from: https://stackoverflow.com/a/8758614
    $('#choose-file').on('change', function() {
        $.ajax({
            url: '/users/edit-avatar',
            type: 'POST',
            data: new FormData($('#choose-file-form')[0]),
            cache: false,
            contentType: false,
            processData: false
        });
    });

    $('#theme-btn').click(function() {
        $dropdown = $('#theme-dropdown');
        if ($dropdown.hasClass('hidden')) {
            $dropdown.removeClass('hidden');
        } else {
            $dropdown.addClass('hidden');
        }
    });

    $('#theme-dropdown a').click(function() {
        $('#theme-dropdown').addClass('hidden');
        $('#theme-btn').text($(this).text() + ' Theme');
        $('#theme-select').val($(this).attr('data-value')).change();
    });
});