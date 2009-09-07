/*-----------------------------------------------------------------------------
	Make things selectable
-----------------------------------------------------------------------------*/
	
	jQuery.fn.symphonySelectable = function() {
		return this.each(function() {
			var self = jQuery(this);
			var methods = {
				// Raise a new event:
				raise:			function(name) {
					self.trigger(jQuery.Event(name));
				},
				
				// Silent action:
				silence:		function() { return false; },
				
				// Selection control:
				start:			function() {
					if (!self.hasClass('selected')) {
						self.addClass('selecting');
						methods.raise('selecting');
						
					} else {
						self.addClass('deselecting');
						methods.raise('deselecting');
					}
					
					jQuery(document).mouseup(methods.stop);
				},
				
				stop:			function() {
					jQuery(document).unbind('mouseup', methods.stop);
					
					if (self.hasClass('selecting')) {
						self.removeClass('selecting').addClass('selected');
						methods.raise('selected');
						
					} else {
						self.removeClass('deselecting selected');
						methods.raise('deselected');
					}
					
					methods.raise('toggled');
				},
				
				toggle:			function() {
					self.trigger('mousedown').trigger('mouseup');
				},
				
				select:			function() {
					
				},
				
				toggle:			
			};
			
			self.bind('selectstart', methods.silence);
			self.bind('mousedown', methods.silence);
			self.bind('mousedown', methods.start);
			self.bind('toggle', methods.toggle);
		});
	};
	
/*---------------------------------------------------------------------------*/