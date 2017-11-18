function openFolderItems() { 
	var $items = $(this).find('.folder-items');
	if ($items.hasClass('hidden')) {
		$('.folder-items').addClass('hidden');
		$items.removeClass('hidden');
	} else {
		$items.addClass('hidden');
	}
}

function openFolderEditor(e) {
	if (e) e.stopPropagation();
	var $parent = $(this).parent();
	var $name = $parent.find('.name');
	$name.addClass('hidden');
	var $edit = $parent.find('.edit');
	$edit.addClass('hidden');
	$editor = $parent.find('.editor');
	$editor.removeClass('hidden');
	$editor.select();

	function closeFolderEditor() {
		$editor.addClass('hidden');
		$edit.removeClass('hidden');
		$name.text($editor.val());
		$name.removeClass('hidden');
		
		$editor.unbind('focusout');
		$editor.unbind('keypress');
	}

	$editor.focusout(closeFolderEditor);
	$editor.keypress(function(e) {
		var key = e.which;
		if (key == 13) {		// enter keycode
			closeFolderEditor();
		}
	});
}

function initFolder() {
	$(this).click(openFolderItems);
	$(this).find('.edit').click(openFolderEditor)
}

$(document).ready(function() {
	$('.folder').each(initFolder);

	$('#new-folder').click(function() {
		var name = 'New Folder';
		var $folder = $('<div>', {
			class: 'folder'
		});

		var $name = $('<span>', {
			class: 'name',
			text: name
		});

		var $editor = $('<textarea>', {
			class: 'hidden editor',
			text: name
		});

		var $edit = $('<button>', {
			class: 'edit mdl-button mdl-js-button mdl-button--icon'
		});

		var $icon = $('<i>', {
			class: 'material-icons',
			text: 'mode_edit'
		});

		var $items = $('<div>', {
			class: 'folder-items hidden'
		});

		var $table = $('<table>');
		var $tbody = $('<tbody>');

		var $headers = $('<tr>', {
			class: 'headers'
		});
		
		var $left = $('<td>', {
			class: 'left',
			text: 'Name'
		});
		var $mid = $('<td>', {
			class: 'padding',
		});
		var $right = $('<td>', {
			class: 'right',
			text: 'Last Modified'
		});

		$headers.append($left, $mid, $right);
		$tbody.append($headers);
		$table.append($tbody);
		$items.append($table);

		$edit.append($icon);

		$folder.append($name, $editor, $edit, $items);
		initFolder.call($folder);
		$('#folders').append($folder);
		openFolderEditor.call($edit);
	});
});
