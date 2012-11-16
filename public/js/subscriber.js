
//
// CREATE
//
function addSubscriber() {
	var params = {
		description: $('#input-description').val(),
		domain: $('#input-domain').val(),
		port: $('#input-port').val(),
		path: $('#input-path').val(),
		method: $('#input-method').val(),
		active: $('#input-active').is(':checked')
	};
	
	$.post(configuration.server +'/subscriber/', params, function (result) {
		if (! result.status.error) {
			$('#subscriber-grid').flexReload();
			$('#subscriber-add-modal').modal('hide');
			
			$('#input-description').val('');
			$('#input-domain').val('');
			$('#input-port').val('');
			$('#input-path').val('');
			$('#input-method').val('');
			$('#input-active').attr('checked', true);
		} else {
			$('#result-add-subscriber').html('<div class="alert alert-error">'+ result.status.message +'</div>');
		}
	}, 'json');
}

//
// UPDATE
//
function editSubscriber() {
	$.ajax({
		url: configuration.server +'/subscriber/'+ $('#input-id-edit').val(),
		data: {
			description: $('#input-description-edit').val(),
			domain: $('#input-domain-edit').val(),
			port: $('#input-port-edit').val(),
			path: $('#input-path-edit').val(),
			method: $('#input-method-edit').val(),
			active: $('#input-active-edit').is(':checked')
		},
		type: 'PUT',
		dataType: 'json',
		success: function(result) {
			if (result.status.error === false) {
				$('#subscriber-grid').flexReload();
				
				$('#subscriber-edit-modal').modal('hide');
			} else {
				$('#result-edit-subscriber').html('<div class="alert alert-error">'+ result.status.message +'</div>');
			}
		}
	});
}

//
// DELETE
//
function rmSubscribers() {
	keys = $("#subscriber-grid").flexReturnSelected();
	$('#subscriber-rm-modal').modal('hide');
	
	for (key in keys) {
		$.ajax({
			url: configuration.server +'/subscriber/'+ keys[key],
			data: {},
			type: 'DELETE',
			success: function() {
				$("#subscriber-grid").flexReload();
			}
		});
	}
}

function makeEditSubscriber() {
	key = $("#subscriber-grid").flexReturnSelected()[0];
	
	if (key) {
		$('#result-edit-subscriber').html('');
		
		$.ajax({
			url: configuration.server +'/subscriber/'+ key,
			data: {},
			type: 'GET',
			dataType: 'json',
			success: function(result) {
				if (result.status.error === false) {
					$('#input-id-edit').val(key);
					$('#input-description-edit').val(result.data.subscriber.description);
					$('#input-domain-edit').val(result.data.subscriber.domain);
					$('#input-port-edit').val(result.data.subscriber.port);
					$('#input-path-edit').val(result.data.subscriber.path);
					$('#input-method-edit').val(result.data.subscriber.method);
					$('#input-active-edit').attr('checked', result.data.subscriber.active);
					
					$('#subscriber-edit-modal').modal('show');
				}
			}
		});
	}
}

//
// INLINE CODES :(
//
$(document).ready(function() {
	$('#btn-add-subscriber').click(addSubscriber);
	$('#btn-edit-subscriber').click(editSubscriber);
	$('#btn-rm-subscriber').click(rmSubscribers);

	$('.modal').modal('hide').css({
		'margin-top': function () {
			return -($(this).height() / 2);
		}
	});

	$('#subscriber-grid').flexigrid({
		url: configuration.server +'/subscriber',
		dataType: 'json',
		preProcess: function (result) {
			var gridResult = {page: 1, total: 0, rows: []};
			
			if (! result.status.error && result.data.subscribers.length > 0) {
				gridResult.total = result.data.subscribers.length;
				
				for (subscriber in result.data.subscribers) {
					var sub = result.data.subscribers[subscriber];
					
					result.data.subscribers[subscriber].address = sub.method +' http://'+ sub.domain +':'+ sub.port + sub.path;
					gridResult.rows.push({ id: result.data.subscribers[subscriber]._id, cell: result.data.subscribers[subscriber] });
				}
			}
			
			return gridResult;
		},
		colModel : [
			{display: 'Description', name: 'description', width: 240, align: 'left'},
			{display: 'KEY', name : '_id', width: 170, align: 'left'},
			{display: 'Address', name: 'address', width: 360, align: 'left'},
			{display: 'Active', name : 'active', width: 50, align: 'left'}
		],
		buttons : [
			{name: '<i class="icon-plus-sign"></i> Add Subscriber', onpress: function () { $('#subscriber-add-modal').modal('show'); }},
			{separator: true},
			{name: '<i class="icon-edit"></i> Edit Subscriber', onpress: function () { makeEditSubscriber(); }},
			{separator: true},
			{name: '<i class="icon-trash"></i> Delete Subscriber', onpress: function () { $('#subscriber-rm-modal').modal('show'); }},
			{separator: true},
			{name: '<i class="icon-refresh"></i> Refresh', onpress: function () { $('#subscriber-grid').flexReload(); }}
		],
		title: 'Subscribers',
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
