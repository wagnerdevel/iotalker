
//
// CREATE
//
function addPublisher() {
	var params = {
		description: $('#input-description').val(),
		active: $('#input-active').is(':checked'),
		status: $('#input-status').val()
	};
	
	$.post(configuration.server +'/publisher/', params, function (result) {
		if (! result.status.error) {
			$('#publisher-grid').flexReload();
			$('#publisher-add-modal').modal('hide');
			
			$('#input-description').val('');
			$('#input-active').attr('checked', true);
			$('#input-status').val('');
		} else {
			$('#result-add-publisher').html('<div class="alert alert-error">'+ result.status.message +'</div>');
		}
	}, 'json');
}

//
// UPDATE
//
function editPublisher() {
	$.ajax({
		url: configuration.server +'/publisher/'+ $('#input-id-edit').val(),
		data: {
			description: $('#input-description-edit').val(),
			status: $('#input-status-edit').val(),
			active: $('#input-active-edit').is(':checked')
		},
		type: 'PUT',
		dataType: 'json',
		success: function(result) {
			if (result.status.error === false) {
				$('#publisher-grid').flexReload();
				
				$('#publisher-edit-modal').modal('hide');
			} else {
				$('#result-edit-publisher').html('<div class="alert alert-error">'+ result.status.message +'</div>');
			}
		}
	});
}

//
// DELETE
//
function rmPublishers() {
	keys = $("#publisher-grid").flexReturnSelected();
	$('#publisher-rm-modal').modal('hide');
	
	for (key in keys) {
		$.ajax({
			url: configuration.server +'/publisher/'+ keys[key],
			data: {},
			type: 'DELETE',
			success: function() {
				$("#publisher-grid").flexReload();
			}
		});
	}
}

function makeEditPublisher() {
	key = $("#publisher-grid").flexReturnSelected()[0];
	
	if (key) {
		$('#result-edit-publisher').html('');
		
		$.ajax({
			url: configuration.server +'/publisher/'+ key,
			data: {},
			type: 'GET',
			dataType: 'json',
			success: function(result) {
				if (result.status.error === false) {
					$('#input-id-edit').val(key);
					$('#input-description-edit').val(result.data.publisher.description);
					$('#input-status-edit').val(result.data.publisher.status);
					$('#input-active-edit').attr('checked', result.data.publisher.active);
					
					$('#publisher-edit-modal').modal('show');
				}
			}
		});
	}
}

//
// INLINE CODES :(
//
$(document).ready(function() {
	$('#btn-add-publisher').click(addPublisher);
	$('#btn-edit-publisher').click(editPublisher);
	$('#btn-rm-publisher').click(rmPublishers);

	$('.modal').modal('hide').css({
		'margin-top': function () {
			return -($(this).height() / 2);
		}
	});

	$('#publisher-grid').flexigrid({
		url: configuration.server +'/publisher',
		dataType: 'json',
		preProcess: function (result) {
			var gridResult = {page: 1, total: 0, rows: []};
			
			if (! result.status.error && result.data.publishers.length > 0) {
				gridResult.total = result.data.publishers.length;
				
				for (publisher in result.data.publishers) {
					gridResult.rows.push({ id: result.data.publishers[publisher]._id, cell: result.data.publishers[publisher] });
				}
			}
			
			return gridResult;
		},
		colModel : [
			{display: 'Description', name: 'description', width: 260, align: 'left'},
			{display: 'KEY', name: '_id', width: 180, align: 'left'},
			{display: 'Status', name: 'status', width: 120, align: 'left'},
			{display: 'Active', name: 'active', width: 130, align: 'left'}
		],
		buttons : [
			{name: '<i class="icon-plus-sign"></i> Add Publisher', onpress: function () { $('#publisher-add-modal').modal('show'); }},
			{separator: true},
			{name: '<i class="icon-edit"></i> Edit Publisher', onpress: function () { makeEditPublisher(); }},
			{separator: true},
			{name: '<i class="icon-trash"></i> Delete Publisher', onpress: function () { $('#publisher-rm-modal').modal('show'); }},
			{separator: true},
			{name: '<i class="icon-refresh"></i> Refresh', onpress: function () { $('#publisher-grid').flexReload(); }}
		],
		title: 'Publishers',
		method: 'GET',
		showTableToggleBtn: true,
		width: 900,
		height: 250
	});

	$.fn.flexReturnSelected = function() { // returns IDs of selected TRs
		var selected = [];
		
		this.each(function() {
			if (this.grid) {
				$('.trSelected', this).each(function() {
					selected.push(this.id.substring(3));
				});
			}
		});

		return selected;
	};
});
