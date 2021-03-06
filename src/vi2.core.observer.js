/* 
* name: Vi2.Observer 
*	author: niels.seidel@nise81.com
* license: BSD New
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*	- clear overlay-container and other at updateVideo()
*	- allow page back, offer bread crumb menu, ...
*	- RSS: http://code.google.com/apis/youtube/2.0/reference.html
*/
	
Vi2.Observer = $.inherit(/** @lends Observer# */{
	
	/** 
	*		@constructs
	*		@params {object} options  
	*/
	__constructor : function(options) { 
		this.options = $.extend(this.options, options); 
		this.widget_list = {}; // Assoc Array is an Object // Object.size(this.widget_list)
		this.clock = new Vi2.Clock({}, this.options.clockInterval);  
		//this.init();	

		//this.testing();
	},
	
	// defaults
	name : 'observer',
	options : {
		id: 'start', 
		embed: true, 
		//thumbnail: '/vi-lab/img/placeholder.jpg',
		selector: '#screen', 
		clockInterval: 500, videoSelector: '#video1', videoWidth:500, videoHeight:375, videoControlsSelector:'.video-controls', markupType: 'wiki', childtheme:''},
	pieList : $('<ul></ul>').attr('class', 'pieContextMenu').attr('id', 'menu'),
	player : undefined,
	clock : undefined,
	parseSelector : '',
	widget : undefined,
	widget_list : [],
	hooks : [],
	vid_arr : [],
	current_stream : 'start',
	seek : 0,
	parser : '',
	
	/* .. */
	setCurrentStream : function(stream, seek){ 
		this.current_stream = stream;
		this.seek = seek; 
		/*$(vi2.dom)
			.empty()
			.append(vi2.db.getVideoById(stream)); */
		// append video
	  var video = $('<div></div>')
				.attr('type',"video")
				.attr('starttime',0)
				.attr('duration',7)
				.attr('id', "myvideo")
				.text(vi2.db.getStreamById(stream).video)
				.appendTo('#vi2');	
		//this.annotationsToDOM();
		// restart the clock
		this.clock.stopClock();
		this.clock.reset(); 
		// generate and render metadata
		var metadata = new Vi2.Metadata(); 
		// re-parse DOM
		this.parse(vi2.dom, 'html'); 
	},

	/* -- */
	parse : function(selector, markupType){ 
		this.parseSelector = selector;
		this.parser = new Parser(selector, markupType === null ? this.markupType : markupType);
		this.vid_arr = [];  
		this.vid_arr = this.parser.run(); 
		this.clock.stopClock(); 
		this.clock.reset();  
		this.player.loadSequence(this.vid_arr, 0, this.seek );  
					
	},
	

	/* -- */
	init : function(seek){  
		seek = seek === undefined ? 0 : seek;
		var _this = this; 
		var videoo = $('<video></video>')
				.attr('controls', false)
				.attr('autobuffer', true)
				.attr('preload', "metadata")
				.attr('id', this.options.videoSelector.replace(/\#|./,''))
				.addClass('embed-responsive-item')
				.text('Your Browser does not support either this video format or videos at all');
		$(this.options.selector)
			.addClass('embed-responsive embed-responsive-16by9')
			.html(videoo); 
		this.player = new Video({
				embed: this.options.embed, 
				selector: this.options.videoSelector, 
				width:this.options.videoWidth, 
				height:this.options.videoHeight, 
				videoControlsSelector: this.options.videoControlsSelector, 
				theme:this.options.theme, 
				childtheme:this.options.childtheme,
				thumbnail: this.options.thumbnail, 
				seek:seek
			}, this); 
		this.clock.player = this.player;
		
		

		// some event bindings hooks
		$(this).bind('player.ready', function(e, id, i){ 
			_this.setAnnotations(); 
		});
	},
	
		/* --xxxx */
	init2 : function(seek){  
		seek = seek === undefined ? 0 : seek;
		var _this = this; 
		var videoo = $('<video></video>')
				.attr('controls', false)
				.attr('autobuffer', true)
				.attr('preload', "metadata")
				.attr('id', this.options.videoSelector.replace(/\#|./,''))
				.addClass('embed-responsive-item')
				.text('Your Browser does not support either this video format or videos at all');
		$(this.options.selector)
			.addClass('embed-responsive embed-responsive-16by9')
			.html(videoo); 
	
	},
	
	
	/**
	*
	*/
	setAnnotations : function(){   
		var _this = this; 
		this.clock.annotations = [];			 
		this.vid_arr = this.parser.run(); 
		
		$.each(_this.vid_arr[0].annotation, function(i, val){ 		
			_this.clock.addAnnotation(val); 
		}); 
		
		// initiate widgets
		$.each(_this.widget_list, function(j, widget){
			//if( widget.type != 'player-widget' ){ 
				widget.init( _this.vid_arr[0].annotation );				
			//}	
		});
		//vi2.enableEditing('toc');
		
	},
  		
  		
	/** -- */
	checkVideo : function(){
		// proof against available videos
		if(!!document.createElement('video').canPlayType){
			var vidTest = document.createElement("video");
			oggTest = vidTest.canPlayType('video/ogg; codecs="theora, vorbis"');
			if (!oggTest){
				h264Test = vidTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
				if (!h264Test){
					console.log("Sorry. No video support.");
				}else{
					if (h264Test === "probably"){
						//document.getElementById("checkVideoResult").innerHTML="Yeah! Full support!";
					}else{
						//document.getElementById("checkVideoResult").innerHTML="Meh. Some support.";
					}
				}
			}else{
				if (oggTest === "probably"){
					//document.getElementById("checkVideoResult").innerHTML="Yeah! Full support!";
				}else{
					//document.getElementById("checkVideoResult").innerHTML="Meh. Some support.";
				}
			}
		}else{
			console.log("Sorry. No video support. xx");
		}
	}, 
			
			
	/* -- */
	updateLocation : function(identifier, value){ 
		// Exeption for IWRM Education
		if(value === 'Introduction'){
			window.location.replace(window.location.href.split('#')[0]+'#!borchardt2');
			return;
		}
		window.location.replace(window.location.href.split('#')[0] + '#!'+identifier+':'+value.replace(/\ /g, '_'));
	},
  		  		
  		  		
/* WIDGETS *********/

	/* -- */ // - kill switch()!
	addWidget : function(obj){ 
		if(this.widget_list[obj.name] !== null){ 
			//return false;
		}
		var _this = this;   	
		obj.player = this.player; 
		this.clock.addHook(obj.name, obj);	

		if(obj.type === 'annotation'){  
			obj.appendToDOM( this.current_stream ); // former: this.options.id
		}	

		switch(obj.name){
			case 'tags' : // no event bindings	
				 $(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				 $(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
				break;
			case 'highlight' : // no event bindings	
				$(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				$(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
				
				break;	
			case 'xlink' : 
				 $(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				 $(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
				break;
			case 'relatedVideos' :
				$(this.player).bind('video.end', function(e, a){ obj.showLinkSummary(); });
				break;  
			case 'search' : 
				// ...
				break;
			case 'playbackSpeed' :
				break;		
			case 'syncMedia' : 
				 $(_this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				 $(_this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
				break;	
			case 'seqv' :
				// bind to sync both videos
				break;
				case 'map' : // not fully implemented
				 $(_this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				 $(_this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
				break;
			case 'assessment' :
				$(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				$(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
			 	break;	
			case 'assessment-fill-in' : 
				 $(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				 $(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
				break;
			case 'assessment-writing' : 
				 $(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				 $(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
				
				break; 	 		
			case 'toc' :
				//obj.clock = this.clock; 
				$(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
				$(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
				
				break;
			case 'log' :
				$(this.player).bind('log', function(e, msg){ obj.add(msg); });
				break;
			//case 'trace' :
				//break;	 

		}
	
		// register widget	
		this.widget_list[obj.name] = obj;   
		return true; 
	},
	
	
	/* Returns true or false whether the given string is the name of an registered widget or not. */
	isWidget : function(widget){
		return this.widget_list[widget] !== null;	
	},
	
	/* Returns the widget object to the given name. */
	getWidget : function(widget_name){
		return this.widget_list[widget_name];
	},
	
	/* -- */
	removeWidget : function(widget_name){
		// bugy?
		this.widget_list[widget_name] = 0;
	},
	
	



	/* append annotation data of widgets to DOM */
	annotationsToDOM : function(){ 
		var _this = this; 
		$.each(this.widget_list, function(i, widget){ 
			if(widget.type === 'annotation'){  
				widget.appendToDOM( _this.current_stream ); 
			}
		});
	},
  		  		
  		
  		

			
	/* -- */
	ended : function(){ 
		var _this = this;
		// _this.clock.reset(); // if enabled slide sync does not work after vides has ended.
	},

	/* -- */
	pause : function(){ 
		var _this = this;
		_this.clock.stopClock();
	},

	/* -- */
	play : function(){ 
		var _this = this;
		_this.clock.startClock();
	},

	/* -- */
	log : function(msg){
		$(this.player).trigger('log', [msg]);
	},

	/* -- */
	destroy : function(){
		$('video').stop();
		this.clock.reset();
		$('#vi2').empty();
	},
			  		
			
			
			  		
			  		
/* AUTHORING *********/			  		
  		
  		/* -- */
  		addPieItem : function(_name, _img, _callback){
  			var item = $('<li></li>')
  				.append($('<img / >')
  					.attr('src', _img)
  					.attr('alt','')
  					.attr('href','#')
//  					.bind('mouseup', {}, function(){ window.[_callback]; })
  				);
  			this.pieList.append(item);
  		},  
  		
  		/* -- */
  		openScreen : function(selector){ 
  			if(selector === undefined){
  				selector = '.vi2-video-player'; 
  			}
  			//this.player.pause();
  			if($('.screen').length === 0){
					var screen = $('<div></div>')
					 .addClass('screen');
					//.width($(selector).width()-18)
					//.height($(selector).height()-10)
				
					$('.screen')
						.show()
						.appendTo(selector);
			
  				return screen;
  			}
  		},
  		
  		/* -- */
  		closeScreen : function(){
  			$('.screen').remove();
  			this.player.play();
  		}
  		
  });
	
	
	
	
	
		
	
	
