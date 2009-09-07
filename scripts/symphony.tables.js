/*-----------------------------------------------------------------------------
	Tables plugin
-----------------------------------------------------------------------------*/
	
	jQuery.fn.tables = function(custom_settings) {
		var self = this;
		var settings = {
			rows:			'> tbody > tr',
			cells:			'> td',
			orderable:		false,
			selectable:		false
		};
		var language = {
			select:			'Select All',
			deselect:		'Deselect All'
		};
		var storage = {
			ordering:		{},
			selecting:		{}
		};
		var widgets = {
			rows:			null,
			controls:		null,
			select:			null,
			deselect:		null
		};
		var methods = {
			// Raise a new event:
			raise:			function(name) {
				self.trigger(jQuery.Event(name));
			},
			
			// Silent action:
			silence:		function() { return false; },
			
			// Select:
			select_state:	function() {
				if (storage.selecting.row) {
					storage.selecting.row
						.removeClass('selecting deselecting');
				}
				
				storage.selecting = {
					row:		null,
					started:	false
				};
			},
			select:			function(row) {
				methods.select_state();
				storage.selecting.started = true;
				storage.selecting.row = row.addClass('selecting');
				
				methods.raise('selecting');
				
				jQuery(document).mouseup(methods.selected);
			},
			selected:		function() {
				jQuery(document).unbind('mouseup', methods.selected);
				
				if (storage.selecting.started) {
					storage.selecting.row
						.removeClass('selecting deselecting')
						.addClass('selected')
						.find('input:first')
						.click();
					
					methods.select_state();
					methods.raise('selected');
					methods.refresh();
				}
				
				return false;
			},
			deselect:		function(row) {
				methods.select_state();
				storage.selecting.started = true;
				storage.selecting.row = row.addClass('deselecting');
				
				methods.raise('deselecting');
				
				jQuery(document).mouseup(methods.deselected);
			},
			deselected:		function() {
				jQuery(document).unbind('mouseup', methods.deselected);
				
				if (storage.selecting.started) {
					storage.selecting.row
						.removeClass('selecting deselecting selected')
						.find('input:first')
						.click();
					
					methods.select_state();
					methods.raise('deselected');
					methods.refresh();
				}
				
				return false;
			},
			
			// Order instances:
			order_state:	function() {
				if (storage.ordering.instance) {
					storage.ordering.instance
						.removeClass('ordering');
				}
				
				storage.ordering = {
					row:		null,
					min:		null,
					max:		null,
					delta:		0,
					started:	false
				};
			},
			order:			function(row) {
				methods.order_state();
				storage.ordering.row = row;
				
				jQuery(document).mousemove(methods.ordering);
				jQuery(document).mouseup(methods.ordered);
			},
			ordering:		function(event) {
				var row = storage.ordering.row;
				var target, next, top = event.pageY;
				var a = row.height();
				var b = row.offset().top;
				
				storage.ordering.min = Math.min(b, a + (row.prev().offset().top || -Infinity));
				storage.ordering.max = Math.max(a + b, b + (row.next().height() ||  Infinity));
				
				if (!storage.ordering.started) {
					storage.ordering.row.addClass('ordering');
					storage.ordering.started = true;
					methods.select_state();
					methods.raise('ordering');
				}
				
				methods.refresh();
				
				if (top < storage.ordering.min) {
					target = row.prev();
					
					while (true) {
						storage.ordering.delta--;
						next = target.prev();
						
						if (next.length === 0 || top >= (storage.ordering.min -= next.height())) {
							row.insertBefore(target); break;
						}
						
						target = next;
					}
					
				} else if (top > storage.ordering.max) {
					target = row.next();
					
					while (true) {
						storage.ordering.delta++;
						next = target.next();
						
						if (next.length === 0 || top <= (storage.ordering.max += next.height())) {
							row.insertAfter(target); break;
						}
						
						target = next;
					}
					
				} else {
					return;
				}
				
				return false;
			},
			ordered:		function(event) {
				jQuery(document).unbind('mousemove', methods.ordering);
				jQuery(document).unbind('mouseup', methods.ordered);
				
				if (storage.ordering.started) {
					storage.ordering.row.removeClass('ordering');
					methods.order_state();
					methods.raise('ordered');
					methods.refresh();
				}
				
				return false;
			},
			
			// Refresh display:
			refresh:		function() {
				var select_toggle = false;
				
				widgets.rows = self.find(settings.rows);
				
				widgets.rows.each(function(position) {
					var row = jQuery(this).removeClass('odd end start end');
					var prev = row.prev(), next = row.next();
					
					if (position % 2 == 0) row.addClass('odd');
					else row.addClass('even');
					
					// Selection start:
					if (row.hasClass('selected') && !prev.hasClass('selected') && !prev.hasClass('ordering')) {
						row.addClass('start');
					}
					
					// Selection end:
					if (row.hasClass('selected') && !next.hasClass('selected') && !next.hasClass('ordering')) {
						row.addClass('end');
					}
					
					if (!row.hasClass('selected')) select_toggle = true;
				});
				
				if (settings.selectable) {
					if (select_toggle) {
						widgets.select.removeClass('disabled');
						widgets.deselect.addClass('disabled');
						
					} else {
						widgets.select.addClass('disabled');
						widgets.deselect.removeClass('disabled');
					}
				}
				
				methods.raise('refreshed', {
					rows:	widgets.rows
				});
			},
		};
		var callbacks = {
			rows:		function(filter) {
				if (!filter) return widgets.rows;
				return widgets.rows.filter(filter);
			}
		};
		
		// Initialize plugin:
		jQuery.extend(settings, custom_settings);
		
		self = jQuery(self).addClass('tables');
		self.rows = callbacks.rows;
		
		if (settings.orderable) self.addClass('orderable');
		if (settings.selectable) self.addClass('selectable');
		
		// Set default states:
		methods.select_state();
		methods.order_state();
		
		widgets.controls = self.find('> .controls:last > tr > td');
		
		if (widgets.controls.length < 1) {
			widgets.controls = self
				.append('<tfoot class="controls"><tr><td colspan="5" /></tr></tfoot>')
				.children('.controls:last > tr > td');
		}
		
		widgets.controls.attr('colspan', self.find('thead th').length);
		
		widgets.deselect = widgets.controls
			.prepend('<a class="select-none" />')
			.children('.select-none')
			.text(language.deselect);
		
		widgets.deselect.bind('selectstart', methods.silence);
		widgets.deselect.bind('mousedown', methods.silence);
		widgets.deselect.click(function() {
			if (jQuery(this).hasClass('disabled')) return;
			
			self.rows('.selected').each(function() {
				jQuery(this).mousedown().mouseup();
			});
		});
		
		widgets.select = widgets.controls
			.prepend('<a class="select-all" />')
			.children('.select-all')
			.text(language.select);
			
		widgets.select.bind('selectstart', methods.silence);
		widgets.select.bind('mousedown', methods.silence);
		widgets.select.click(function() {
			if (jQuery(this).hasClass('disabled')) return;
			
			self.rows(':not(.selected)').each(function() {
				jQuery(this).mousedown().mouseup();
			});
		});
		
		if (!settings.selectable) {
			widgets.select.addClass('disabled');
			widgets.deselect.addClass('disabled');
		}
		
		widgets.action = self.find(settings.action).remove();
		
		widgets.rows = self.find(settings.rows);
		widgets.rows.each(function() {
			var row = jQuery(this);
			
			if (settings.selectable) {
				row.mousedown(function() {
					if (row.hasClass('selected')) {
						methods.deselect(row);
						
					} else {
						methods.select(row);
					}
					
					return false;
				});
			}
			
			if (settings.orderable) {
				row.mousedown(function() {
					methods.order(jQuery(this)); return false;
				});
			}
		});
		
		methods.refresh();
		methods.raise('initialized');
		
		return self;
	};
	
/*---------------------------------------------------------------------------*/