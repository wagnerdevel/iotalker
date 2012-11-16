
//
// CREATE
//
function addSubscriber(subscriberId) {
	var params = {
		subscriber_id: subscriberId,
		publisher_id: $("#contract-grid").flexReturnSelected()[0]
	};
	
	$.post(configuration.server +'/contract/', params, function (result) {
		if (result.status.error) {
			$('#result-add-contract').html('<div class="alert alert-error">'+ result.status.message +'</div>');
		}
	}, 'json');
}

//
// DELETE
//
function rmSubscriber(subscriberId) {
	key = $("#contract-grid").flexReturnSelected()[0];
	
	$.ajax({
		url: configuration.server +'/contract/'+ subscriberId,
		data: {publisher_id: key},
		type: 'DELETE'
	});
}

function makeContracts() {
	key = $("#contract-grid").flexReturnSelected()[0];
	
	if (key) {
		$('#result-edit-contract').html('');
		
		var template = '<li><label for="subscriber%id">%description <span>%id</span></label>';
		template += '<input type="checkbox" value="%id" id="subscriber%id"/></li>';
		
		$.ajax({
			url: configuration.server +'/subscriber/',
			data: {},
			type: 'GET',
			dataType: 'json',
			success: function(result) {
				$('#contracts-modal').modal('show');
				
				if (result.status.error === false) {
					var html = '';
					
					if (result.data.subscribers.length > 0) {
						for (subscriber in result.data.subscribers) {
							var li = template.replace(new RegExp('%id', 'g'), result.data.subscribers[subscriber]._id);
							
							li = li.replace('%description', result.data.subscribers[subscriber].description);
							
							html += li;
						}
						
						$('#result-subscribers').html(html);
						
						$.ajax({
							url: configuration.server +'/contract/'+ key,
							data: {},
							type: 'GET',
							dataType: 'json',
							success: function(result) {
								$('#contracts-modal').modal('show');
								
								if (result.status.error === false) {
									for (contract in result.data.contracts) {
										$('#subscriber'+ result.data.contracts[contract].subscriber_id).attr('checked', 'checked');
									}
									
									listBoxBind();
								}
							}
						});
					}
				}
			}
		});
	}
}

function listBoxBind() {
	$('.listbox .list li input[type="checkbox"]').each(function() {
		if (this.checked)
			$($(this).parents().get(0)).addClass('selected');
	});
	
	$('.listbox .list li input').change(function() {
		if (this.checked) {
			addSubscriber($(this).val());
			
			$($(this).parents().get(0)).addClass('selected');
		} else {
			rmSubscriber($(this).val());
			
			$($(this).parents().get(0)).removeClass('selected');
		}
	});
}

//
// INLINE CODES :(
//
$(document).ready(function() {
	$('.modal').modal('hide').css({
		'margin-top': function () {
			return -($(this).height() / 2);
		}
	});
	
	$('#contract-grid').flexigrid({
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
			{display: 'Publisher KEY', name: '_id', width: 170, align: 'left'},
			{display: 'Publisher Description', name: 'description', width: 290, align: 'left'}
		],
		buttons : [
			{name: '<i class="icon-edit"></i> Edit Contracts', onpress: function () { makeContracts(); }}
		],
		title: 'Contracts',
		method: 'GET',
		showTableToggleBtn: true,
		onSuccess: function () {
			$('#contract-grid').find('tr').each(function () {
				$(this).click(function () {
					$('#contract-grid').find("tr").removeClass("trSelected");
					$(this).addClass("trSelected");
				});
			});
		},
		width: 900,
		height: 250
	});
	
	$.fn.flexReturnSelected = function() {
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
