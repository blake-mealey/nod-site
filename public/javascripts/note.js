$(document).ready(function() {
    var $title = $('#note-title');
    var $editor = $('#note-title-editor');
    var $noteData = $('#note-data');
    $title.click(function() {
        $title.addClass('hidden');
        $editor.removeClass('hidden');
        $editor.select();

        function closeTitleEditor() {
            var lastName = $title.text();
            var newName = $editor.val();

            $editor.addClass('hidden');
            $title.text(newName);
            $title.removeClass('hidden');

            if (newName == 'Untitled note') {
                $title.addClass('untitled');
            } else {
                $title.removeClass('untitled');
            }

            $editor.unbind('focusout');
            $editor.unbind('keypress');

            $.post('/notes/edit-name', {
                id: $noteData.attr('data-id'),
                name: newName
            }, function(res) {
                if (!res.ok) {
                    $title.text(lastName);
                    $editor.val(lastName);
                    if (newName == 'Untitled note') {
                        $title.addClass('untitled');
                    } else {
                        $title.removeClass('untitled');
                    }
                }
            })
        }

        // $editor.focusout(closeTitleEditor());
        $editor.keypress(function(e) {
            if (e.which == 13) {
                closeTitleEditor();
            }
        });
    });
});
