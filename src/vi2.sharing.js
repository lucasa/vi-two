/* 
* name: Vi2.Sharing
* author: niels.seidel@nise81.com
* license:
* description:
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - add sharing link for a popup
*	 - add sharing facilities for social media applications
*/


Vi2.Sharing = $.inherit(/** @lends Vi2.TableOfContents# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {String} options.selctor Selector to append the ahring button
		*		@param {boolean} options.shareLink 
		*		@param {boolean} options.shareEmbedLink 
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'sharing',
		type : 'player-plugin',
		options : {
			selector : '.control-bar',
			shareLink : true,
			shareEmbedLink: true
		},
	
		/**
		* Creates an control element to allow users to share the video 
		*/
		init: function(){
			var _this = this;
			var html = new EJS({url: vi2.templatePath+'vi2.sharing.ejs'});
  				//.render( this.metadata );
				$( this.options.selector ).append( html );
			
			// create button		
			$('<a></a>')
				.addClass('vi2-video-sharing vi2-btn')
				.text('</>')
				.click(function(){ 
					$('.player-share')
						.appendTo('body')
						//.toggle()
						.css('top', '20px')
						.css('left', '250px');
						 
					var url = window.location.href.slice(window.location.href.indexOf('#') + 1);
					
					/*	
					$('.player-share-popup').val('<iframe src="http://www.iwrm-education.org/popup.html?id='+url+'" width="100" height="20"></iframe>') //also: title=bim&lecturer=sam
						.bind("focus",function(e){ $(this).select(); })
						.bind("mouseup",function(e){ return false; });	
					*/
					
					// share link
					if( _this.options.shareLink ){
						$('.player-share-link').val('http://www.iwrm-education.org/embed.html#'+url)
							.bind("focus",function(e){
									$(this).select();
							})
							.bind("mouseup",function(e){
									return false;
							});
					}
					
					// share embed link
					if( _this.options.shareEmbedLink ){
						$('.player-share-embed').val('<iframe src="http://www.iwrm-education.org/embed.html#'+url+'" width="935" height="610"></iframe>')
							.bind("focus",function(e){ 
								$(this).select(); 
							})
							.bind("mouseup",function(e){ 
								return false; 
							});
					}		
				})
				.appendTo( this.options.selector );
				//
				$('.player-share-close').button().click(function(){
					$('.player-share').hide();
				})
		
		},
		
		
		/**
		*/
		prepareEmbedMarkup : function(){
			var code = $();
			// add css
			var sc
			// add js
			var js = $('<script></script')
				.attr('type','text/javascript')
			// add html
			return code.html();
		}	
}); // end class
