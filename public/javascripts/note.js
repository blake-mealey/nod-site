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

function updateTinymceText(summary) {
    summary = " " + summary + '<br>\n</br>';
    tinymce.activeEditor.execCommand('mceInsertContent', false, summary);
}

function summarize(sentence) {
    sentence = sentence.trim();
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    return sentence;
}

function makeSummaryBox(summary) {
    var $summaryElement = $('<div>', {
        class: 'summary-element'
    });

    var $summaryBtn = $('<div>', {
        class: 'add-summary-btn material-icons md-48',
        text: 'add_box'
    });

    var $summaryText = $('<textarea>', {
        class: 'summary-text',
        text: summary
    });
    $summaryText.prop('readonly', true);

    $summaryBtn.click(function() {
        updateTinymceText($(this).parent().find('.summary-text').text());
    });

    $summaryElement.append($summaryBtn);
    $summaryElement.append($summaryText);
    return $summaryElement;
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
    var recordingActivated = false;
    // Setup for voice recognition
    if (!('webkitSpeechRecognition' in window)) {
        console.error("Need webkit speech recognition!!");
    } else {
        console.warn("HAS SPEECH RECOGNITION!!!");

        // Setup voice recognition. This should NOT be here...
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'English';

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
            final_transcript = summarize(final_transcript);
            var $summaryElement = makeSummaryBox(final_transcript);
            $('#summary-section').prepend($summaryElement);
        }

        recognition.onend = function () {
            console.warn('Speech recognition service disconnected');
            if (recordingActivated) {
                recognition.start();
                console.warn("Restarted");
            }
        }
    };

    $('#start-record-btn').click(function () {
        if (recognition) {
            recordingActivated = true;
            recognition.start();
        }
        $('#start-record-btn').addClass('hidden');
        $('#stop-record-btn').removeClass('hidden');
    });

    $('#stop-record-btn').click(function () {
        if (recognition) {
            recordingActivated = false;
            recognition.stop();
        }
        $('#stop-record-btn').addClass('hidden');
        $('#start-record-btn').removeClass('hidden');
    });
});
