/*-----------------------------------------------------------------------------
	Quick easy button control
-----------------------------------------------------------------------------*/
	
	jQuery.fn.symphonyButton = function() {
		return this.each(function() {
			var self = jQuery(this);
			var methods = {
				// Raise a new event:
				raise:			function(name) {
					self.trigger(jQuery.Event(name));
				},
				
				// Silent action:
				silence:		function() { return false; },
				
				// Trigger action:
				trigger:		function() {
					if (self.hasClass('disabled')) return;
					
					methods.raise('triggered');
				},
				
				disable:		function() {
					self.addClass('disabled');
				},
				
				enable:			function() {
					self.removeClass('disabled');
				}
			};
			
			self.bind('selectstart', methods.silence);
			self.bind('mousedown', methods.silence);
			self.bind('click', methods.trigger);
			self.bind('disable', methods.disable);
			self.bind('enable', methods.enable);
		});
	};
	
/*---------------------------------------------------------------------------*/