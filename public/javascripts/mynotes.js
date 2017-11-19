function openFolderItems() { 
	if ($(this).hasClass('folder-open')) {
		$(this).removeClass('folder-open');
	} else {
		$('.folder').removeClass('folder-open folder-selected');
		$(this).addClass('folder-open folder-selected');
	}
}

function openFolderEditor(e) {
	if (e) e.stopPropagation();
	var $folder = $(this).parent();
	var $name = $folder.find('.name');
	$name.addClass('hidden');
	var $edit = $folder.find('.edit');
	$edit.addClass('hidden');
	$editor = $folder.find('.editor');
	$editor.removeClass('hidden');
	$editor.select();

	function closeFolderEditor() {
		var lastName = $name.text();
		var newName = $editor.val();

		$editor.addClass('hidden');
		$edit.removeClass('hidden');
		$name.text(newName);
		$name.removeClass('hidden');
		
		$editor.unbind('focusout');
		$editor.unbind('keypress');

		$.post('./folders/edit', {
			id: $folder.attr('data-id'),
			name: newName
		}, function(res) {
			if (!res.ok) {
				$name.text(lastName);
				$editor.val(lastName);
			}
		});
	}

	$editor.focusout(closeFolderEditor);
	$editor.keypress(function(e) {
		if (e.which == 13) {
			closeFolderEditor();
		}
	});
}

function initFolder() {
	$(this).mouseenter(function() {
		$(this).addClass('folder-selected');
	});
	$(this).mouseleave(function() {
		if (!$(this).hasClass('folder-open')) {
			$(this).removeClass('folder-selected');
		}
	});
	$(this).click(openFolderItems);
	$(this).find('.edit').click(openFolderEditor)
}

function makeFolder(name) {
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
	return $folder;
}

$(document).ready(function() {
	$('.folder').each(initFolder);

	$('#new-folder').click(function() {
		var name = 'New Folder';
		$.post('/folders/new', {
			name: name
		}, function(res) {
			console.log(res);
			if (res.ok) {
				$folder = makeFolder(name);
				$folder.attr('data-id', res.id);
				initFolder.call($folder);
				$('#folders').append($folder);
				openFolderEditor.call($folder.find('.edit'));
			}
		});
	});
});
