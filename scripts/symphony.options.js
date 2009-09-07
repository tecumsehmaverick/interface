/*-----------------------------------------------------------------------------
	Convert select boxes into usable boxes:
-----------------------------------------------------------------------------*/
	
	jQuery.fn.symphonySelect = function(custom_settings, custom_language) {
		var settings = jQuery.extend(
			{
				select:			'> select'
			},
			custom_settings
		);
		var language = jQuery.extend(
			{
				select:			'Select All',
				deselect:		'Deselect All',
				reset:			'Reset'
			},
			custom_language
		);
		
		return this.each(function() {
			var self = this;
			var widgets = {
				options:		null,
				controls:		null,
				select:			null,
				deselect:		null,
				reset:			null
			};
			var methods = {
				// Raise a new event:
				raise:			function(name) {
					self.trigger(jQuery.Event(name));
				},
				
				// Silent action:
				silence:		function() { return false; },
				
				// Toggled selection:
				toggled:		function() {
					var item = jQuery(this);
					
					item.find('input:first')
						.attr('checked', item.hasClass('selected'));
				},
				
				reset:			function() {
					widgets.options
						.trigger('deselect')
						.filter('.was-selected')
						.trigger('select');
				},
				
				// Refresh display:
				refresh:		function() {
					var select_toggle = false;
					
					widgets.options.each(function(position) {
						var option = jQuery(this).removeClass('odd end start end');
						var prev = option.prev(), next = option.next();
						
						if (position % 2 == 0) option.addClass('odd');
						else option.addClass('even');
						
						// Selection start:
						if (option.hasClass('selected') && !prev.hasClass('selected') && !prev.hasClass('ordering')) {
							option.addClass('start');
						}
						
						// Selection end:
						if (option.hasClass('selected') && !next.hasClass('selected') && !next.hasClass('ordering')) {
							option.addClass('end');
						}
						
						if (!option.hasClass('selected')) select_toggle = true;
					});
					
					if (select_toggle) {
						widgets.select.removeClass('disabled');
						widgets.deselect.addClass('disabled');
						
					} else {
						widgets.select.addClass('disabled');
						widgets.deselect.removeClass('disabled');
					}
					
					methods.raise('refreshed', {
						options:	widgets.options
					});
				},
			};
			var callbacks = {
				options:		function(filter) {
					if (!filter) return widgets.options;
					return widgets.options.filter(filter);
				}
			};
			
			// Initialize plugin:
			self = jQuery(self).addClass('symphony-select');
			self.options = callbacks.options;
			
			if (self.find(settings.select).attr('multiple')) {
				settings.multiselect = true;
				self.addClass('multiselect');
				
			} else {
				self.addClass('singleselect');
			}
			
			widgets.contents = self
				.prepend('<div class="contents" />')
				.children('.contents:first');
				
			self.find(settings.select).children().each(function() {
				var source = jQuery(this);
				var name = source.parent().attr('name');
				var option = jQuery('<div />').text(source.text());
				var input = option
					.prepend('<input type="checkbox" name="' + name + '" />')
					.children('input:first').val(source.val());
				
				if (source.attr('selected')) {
					option.addClass('selected was-selected');
					input.attr('checked', 'checked');
				}
				
				widgets.contents.append(option);
			});
			
			self.find(settings.select).remove();
			widgets.options = widgets.contents.children();
			
			widgets.controls = self
				.append('<div class="controls" />')
				.children('.controls:last');
			
			// Add deselect button:
			widgets.select = jQuery('<a class="selection-select" />')
				.symphonyButton()
				.text(language.select)
				.appendTo(widgets.controls);
				//.bind('triggered', methods.select);
			
			// Add deselect button:
			widgets.deselect = jQuery('<a class="selection-deselect" />')
				.symphonyButton()
				.text(language.deselect)
				.appendTo(widgets.controls);
				//.bind('triggered', methods.deselect);
			
			// Add reset button:
			widgets.reset = jQuery('<a class="selection-reset" />')
				.symphonyButton()
				.text(language.reset)
				.appendTo(widgets.controls)
				.bind('triggered', methods.reset);
			
			// Make things selectable:
			widgets.options.symphonySelectable()
				.bind('selected', methods.toggled)
				.bind('deselected', methods.toggled);
			
			methods.refresh();
		});
	};
	
/*---------------------------------------------------------------------------*/