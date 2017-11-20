var $title, $editor, $noteData, $currentSummaryText, $currentSummaryBtn;

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

function activateSummaryBox(summary) {
    $currentSummaryBtn.addClass('ready');
    $currentSummaryText.text(summary);
    $currentSummaryText.removeClass('interim');
    $currentSummaryBtn.click(function () {
        updateTinymceText($(this).parent().find('.summary-text').text());
    });

    $currentSummaryBtn = null;
    $currentSummaryText = null;

    $.post('/notes/saveSentence', {
        id: $noteData.attr('data-id'),
        sentence: summary
    }, function(res) {
        console.log(res);
    });
}

function makeSummaryBox(summary) {
    var $summaryElement = $('<div>', {
        class: 'summary-element'
    });

    $currentSummaryBtn = $('<div>', {
        class: 'add-summary-btn material-icons md-48',
        text: 'add_box'
    });

    $currentSummaryText = $('<textarea>', {
        class: 'summary-text interim',
        text: summary
    });
    $currentSummaryText.prop('readonly', true);

    $summaryElement.append($currentSummaryBtn);
    $summaryElement.append($currentSummaryText);
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
        recognition.interimResults = true;
        recognition.lang = 'English';

        recognition.onresult = function (event) {
            var interimTranscript = '';
            var finalTranscript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                    
                }
            }
            if (interimTranscript.length > 0) {
                if (!$currentSummaryText) {
                    var $summaryElement = makeSummaryBox("");
                    $('#summary-section').prepend($summaryElement);
                }
                $currentSummaryText.text(interimTranscript);
            } else if (finalTranscript.length > 0) {
                var finalSummary = summarize(finalTranscript);
                activateSummaryBox(finalSummary);
            }
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

    $('.add-summary-btn').click(function () {
        updateTinymceText($(this).parent().find('.summary-text').text());
    });
        
    var contents = $noteData.attr('data-content');
    window.setInterval(function() {
        var newContents = tinymce.activeEditor.getContent({ format: 'raw' });
        if (contents != newContents) {
            contents = newContents;
            // console.log('CONTENT CHANGED!')
            $.post('/notes/saveContent', {
                id: $noteData.attr('data-id'),
                content: newContents
            }, function(res) {
                console.log(res);
            });
        } else {
            // console.log('CONTENT UNCHANGED!');
        }
    }, 5000);

    // TODO: Fix hack.
    window.setTimeout(function() {
        console.log(contents);
        tinymce.activeEditor.setContent(contents);
    }, 1000);
});
