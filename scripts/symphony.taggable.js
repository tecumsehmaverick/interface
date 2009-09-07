/*-----------------------------------------------------------------------------
	Taggable plugin
-----------------------------------------------------------------------------*/
	
	jQuery.fn.taggable = function(custom_settings) {
		var self = this;
		
		self.settings = {
			input:			'> input:first',		// What are we using as the text input?
			tags:			'> ol > li'				// What children do we use as tags?
		};
		
		self.widgets = {
			contents: 		null,
			wrapper: 		null,
			input:			null,
			tags:			null
		};
		
		self.methods = {
			// Raise a new event:
			raise:			function(name, data) {
				var event = jQuery.Event(name);
				
				jQuery.extend(event, data);
				
				self.widgets.contents.trigger(event);
			},
			
			// Manually edit tags:
			manual:			function() {
				var input = self.widgets.input.focus();
				var values = input.val().split(/,\s*/);
				
				self.widgets.tags.each(function() {
					var tag = jQuery(this);
					var value = tag.attr('title') || tag.text();
					var selected = false;
					
					for (var index in values) {
						if (values[index].toLowerCase() == value.toLowerCase()) {
							selected = true; break;
						}
					}
					
					if (selected) {
						tag.addClass('selected');
						
					} else {
						tag.removeClass('selected');
					}
				});
			},
			
			// Toggle tag state:
			toggle:			function(source) {
				var input = self.widgets.input.focus();
				var tag = jQuery(source);
				var value = tag.attr('title') || tag.text();
				
				if (!value) return;
				
				// Add/remove value:
				var values = input.val().split(/,\s*/);
				var removed = false;
				
				for (var index in values) {
					if (values[index].toLowerCase() == value.toLowerCase()) {
						values.splice(index, 1);
						removed = true;
						
					} else if (values[index] == '') {
						values.splice(index, 1);
					}
				}
				
				if (!removed) {
					values.push(value);
					tag.addClass('selected');
					
				} else {
					tag.removeClass('selected');
				}
				
				input.val(values.join(', '));
			},
			
			// Silent action:
			silence:		function() { return false; }
		};
		
		// Initialize plugin:
		self.start = function() {
			jQuery.extend(self.settings, custom_settings);
			
			self.widgets.contents = jQuery(self)
				.addClass('contents');
			self.widgets.wrapper = self.widgets.contents
				.wrap('<div class="taggable" />')
				.parent();
			self.widgets.input = self.widgets.contents
				.find(self.settings.input);
			self.widgets.tags = self.widgets.contents
				.find(self.settings.tags)
				.addClass('tag');
			
			self.methods.manual();
			
			self.widgets.input.bind('keyup', function() {
				return self.methods.manual();
			});
			self.widgets.input.bind('change', function() {
				return self.methods.manual();
			});
			
			self.widgets.tags.bind('selectstart', function() {
				return self.methods.silence();
			});
			self.widgets.tags.bind('mousedown', function() {
				return self.methods.silence();
			});
			self.widgets.tags.bind('click', function() {
				return self.methods.toggle(this);
			});
		};
		
		return self;
	};
	
/*---------------------------------------------------------------------------*/