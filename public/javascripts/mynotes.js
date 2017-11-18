$(document).ready(function() {
	$('.folder').click(function() {
		var $items = $(this).find('.folder-items');
		if ($items.hasClass('hidden')) {
			$('.folder-items').addClass('hidden');
			$items.removeClass('hidden');
		} else {
			$items.addClass('hidden');
		}
	});
});