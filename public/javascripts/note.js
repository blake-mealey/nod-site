var $title, $editor, $noteData;

function initTitleEditor() {
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
}

function openMoveFolders() {
    if ($(this).hasClass('move-btn-open')) {
        $(this).removeClass('move-btn-open');
    } else {
        $(this).addClass('move-btn-open move-btn-selected');
    }
}

function initMoveButton() {
    $(this).mouseenter(function() {
        $(this).addClass('move-btn-selected');
    });
    $(this).mouseleave(function() {
        if (!$(this).hasClass('move-btn-open')) {
            $(this).removeClass('move-btn-selected');
        }
    });
    $(this).click(openMoveFolders);
}

$(document).ready(function() {
    $title = $('#note-title');
    $editor = $('#note-title-editor');
    $noteData = $('#note-data');

    $('#move-btn').each(initMoveButton);
});
