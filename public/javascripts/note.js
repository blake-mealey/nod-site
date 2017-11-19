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

    $title.click(initTitleEditor);
    $('#move-btn').each(initMoveButton);
    $('.move-folder').click(function() {
        $.post('/notes/move-folder', {
            noteId: $noteData.attr('data-id'),
            folderId: $(this).attr('data-id')
        }, function(res) {
            console.log(res);
        });
    });

    var recognition;
    // Setup for voice recognition
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Need webkit speech recognition!!");
    } else {
        console.warn("HAS SPEECH RECOGNITION!!!");

        // Setup voice recognition. This should NOT be here...
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = function (event) {
            var interim_transcript = '';
            var final_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            console.warn('interim: ' + interim_transcript);
            console.warn('final: ' + final_transcript);
            final_transcript = final_transcript.trim();
            final_transcript = final_transcript.charAt(0).toUpperCase() + final_transcript.slice(1);
            $('#summary').prepend(final_transcript + '.\n');
        }
    };

    $('#record-btn').click(function () {
        if (recognition) {
            console.warn("Starting recording!!!");
            recognition.lang = 'English';
            recognition.start();
        } else {
            console.error("CANT RECORD!!!");
        }
    });
});
