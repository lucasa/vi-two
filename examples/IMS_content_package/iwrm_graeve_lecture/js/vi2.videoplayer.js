/*	VideoPlayer
 		author: niels.seidel@nise81.com
 		* This player is inspired by ghinda-VideoPlayer jQuery Plugin by (c) 2010 Cristian-Ionut Colceriu
  

 - simultanous playback of two clips
 - refine cycle including event bindings
 - change all 'bind's inside loadUI into extra functions 
 - visualize loaded bytes
 - audio only?
 - seek?
 - manage to play parts of a video: http://www.xiph.org/oggz/doc/group__seek__api.html
 - bug: slider jumps
 - ui control for playbackrate
 - further: API calls: http://code.google.com/apis/youtube/js_api_reference.html
 
 
 
 */
 
 
var Video = $.inherit(
{
	/**/
  __constructor : function(options, main) {
		this.options = $.extend(this.options, options); 
		this.main = main;
  	this.loadVideo('./'); // load nil video to build player interface
  	this.loadUI();
  },

	name : 'video player',
	// defaults
	options : {main: null, selector: '#video1', wrapControls: '', childtheme:''},
	video : null,
	main : null,
	url : '',
	video_controls : null,
	video_volume : 1,
  video_container : null,
	video_wrap : null,
	play_btn : $(''),
	add_btn : $(''),
	video_seek : null,
	video_timer : null,
	volume : null,
	volume_btn : null,
	seeksliding : null,
	interval : 0,	
	isSequence : false,
	seqList : [],
	seqNum : null,
	seqLoop : false,
	
	/**/
	loadVideo : function(url, seek) {
		var _this = this;
		this.url = url;
	  this.video = document.getElementsByTagName('video')[0];
	  this.video.poster = "img/ff.png";
	  this.video.loop = false; 
	  this.video.preload = true;
	  this.video.autoplay = true; 
	  this.video.controls = false; 
	  this.video.width = 428;
	  this.video.height = 300;
	  $(this.video).html(this.createSource(url, 'video/ogg; codecs="theora, vorbis"'), this.video.firstChild);
		//  this.video.insertBefore(createSource('video.mp4', 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'), video.firstChild.nextSibling);
	  this.video.onerror = function(e){ _this.errorHandling(e); }
		this.video.oncanplay = function(e) {
			// play_btn playpause.disabled = false;
			//alert('playable');
			_this.createSeek();
			main.updateVideo(_this.seqList[_this.seqNum]['id'], _this.seqNum);
			if(seek > 0){
				//_this.currentTime(seek);
			}
		}
		//this.video.readyState = function(){
			// notify observer about new video 
			//main.updateVideo(_this.seqList[_this.seqNum]['id'], _this.seqNum);
		//}
		

		this.video.load(); // not needed ?!
		///////////	this.video.readyState = function(e) { if(seek > 0){ _this.currentTime(seek); }};
		
		// var lastBuffered = video.buffered.end(video.buffered.length-1);
		//alert(this.video.buffered.length+''+this.video.buffered.start()+'___'+this.video.buffered.end(video.buffered.length-1));
		
	},
	
	/*
	loadVideo22 : function(url, seek) {
		  $(this.video).html(this.createSource(url, 'video/ogg; codecs="theora, vorbis"'), this.video.firstChild);
	},
	*/
	
	/**/
	loadSequence : function(sources, num){
		this.seqList = sources;
		this.isSequence = true;	
		if(num == null){ 
			this.seqNum = 0; 
		}else{
			this.seqNum = num % this.seqList.length;
		}
		this.loadVideo(this.seqList[this.seqNum]['url'], 0);
	
	},
	
	/*
	- dirty hack without considering custom events
	- without seeking yet
	*/
	loadCycleVideo : function(url, seek, duration, return_seek){
		/*
		stop/freez orig. video
		load new video in window/frame
		attach annotation to terminate after time is over
		reload orig. video
		seek to previouse temporal position
		play
		*/
		var _this = this;
		this.cycledata = {url: this.main.parseSelector, return_seek: return_seek};
		
		this.main.vid_arr = []; 		this.main.vid_arr[0] = []; this.main.vid_arr[0]['annotations'] = [];
		this.main.vid_arr[0]['annotations'].push({title:'', target:this.url, linktype:'cycle', type:'xlink', x:0, y:0, t1:seek, t2:duration});
		 $(this).bind('annotation.begin.cycle', function(e, a, b){ _this.begin(e, a, b);});
		 $(this).bind('annotation.end.cycle', function(e, a, b){ _this.end(e, a);});
	
		//this.main.updateVideo(0,0);
		
		this.loadVideo(url, seek);
		setTimeout(function(){ $(_this).trigger('annotation.end.cycle'); return '';}, 1000);

	},
	
	cycledata : {},
	begin : function(e, a, b){},
	end : function(e, a){ this.main.parse(this.cycledata.url, 'html');//loadVideo(this.cycledata.url, this.cycledata.return_seek);
	},
	
	/**/
	terminateCycleVideo : function(){
		$(this.options.selector).parent().find('#subvideo').remove();
	},
	
	/**/
	createSource : function(src, type) {
  	var source = document.createElement('source');
  	source.src = src;
  	source.type = type;
  	return source;
	},

	/**/
	loadUI : function(){
		var _this = this;
		var options = {theme: 'simpledark', childtheme: this.options.childtheme};
		var video_wrap = $('<div></div>').addClass('vi2-video-player').addClass(options.theme).addClass(options.childtheme);
		this.video_controls = $('<div class="vi2-video-controls"><a class="vi2-video-play" title="Play/Pause"></a><div class="vi2-video-seek"></div><div class="vi2-video-timer">00:00</div><div class="vi2-btn-box"></div><div class="vi2-volume-box"><div class="vi2-volume-slider"></div><a class="vi2-volume-button" title="Mute/Unmute"></a></div></div>');						

		$(this.options.wrapControls)
			.wrap(video_wrap)
			.after(this.video_controls);
		this.video_container = $(this.options.wrapControls).parent('.vi2-video-player');

		this.play_btn = $('.vi2-video-play', this.video_container);
		this.video_seek = $('.vi2-video-seek', this.video_container);
		this.video_timer = $('.vi2-video-timer', this.video_container);
		this.volume = $('.vi2-volume-slider', this.video_container);
		this.volume_btn = $('.vi2-volume-button', this.video_container);
		this.add_btn = $('.vi2-btn-box', this.video_container);
		

//		this.video_controls.hide(); // keep the controls hidden
		$(this.video).removeAttr('controls');	
		//this.createSeek();
		
		
		//
		$(this.volume).slider({
			value: 1,
			orientation: "vertical",
			range: "min",
			max: 1,
			step: 0.05,
			animate: true,
			slide : function(e,ui){
				_this.video.attr('muted',false);
				_this.video_volume = ui.value;
				_this.video.attr('volume',ui.value);
			}
		});
			
		// event bindings
		$(this.video).parent().bind('mouseover', function() {
			//_this.video_controls.show();					
		});

		$(this.video).parent().bind('mouseout', function() {
			//_this.video_controls.hide();					
		});

		
		this.play_btn.click(function(){ 
			_this.play();
		});

		this.add_btn.text('add tag').click(function(){ 
			_this.main.widget_list['tags'].addTags();
		});
			
		$(this.video).bind('play', function() {
			_this.play_btn.addClass('vi2-paused-button');
			_this.main.play();
		});
			
		$(this.video).bind('pause', function() {
			_this.play_btn.removeClass('vi2-paused-button');
			_this.main.pause();
		});

		$(this.video).bind('ended', function() {
			_this.main.ended();
			_this.video.removeEventListener('ended', arguments.callee, false);
			_this.play_btn.removeClass('vi2-paused-button');
			// load next video clip
			if(_this.isSequence && ((_this.seqNum + 1) < _this.seqList.length || _this.seqLoop)){
				_this.seqNum = (_this.seqNum + 1) % _this.seqList.length;
				_this.loadVideo(_this.seqList[_this.seqNum]['url']);
			}
		}, false);
			
		$(this.video).bind('timeupdate', function(){
			_this.seekUpdate();
		});
		
		this.volume_btn.click(function(){
			_this.muteVolume();	
		});	
												
	},
	
	/**/
	muteVolume : function() {
		if($(this.options.selector).attr('muted')==true) {
			$(this.options.selector).attr('muted', false);
			this.volume.slider('value', video_volume);
			this.volume_btn.removeClass('vi2-volume-mute');					
		} else {
			$(this.options.selector).attr('muted', true);
			this.volume.slider('value', '0');			
			this.volume_btn.addClass('vi2-volume-mute');
		}
	},
	
	/**/
	createSeek : function() {
		var _this = this;
		if(this.video.readyState) {
			clearInterval(this.interval);
			clearInterval(this.interval);
			var video_duration = $(this.options.selector).attr('duration');
			this.video_seek.slider({
				value: 0,
				step: 0.01,
				orientation: "horizontal",
				range: "min",
				max: video_duration,
				animate: false,					
				slide: function(event, ui){							
					_this.seeksliding = true;
				},
				stop: function(e,ui){
					_this.seeksliding = false;				
					$(_this.options.selector).attr("currentTime", ui.value);
				},
				start: function(event, ui){
					_this.seeksliding = true;
				}
			});
			this.video_controls.show();					
		} else {
			// try reinitiate the slider as long th e
			this.interval = setInterval(function() { _this.createSeek();  }, 150);	
		}
	},	

	
	/**/
	timeFormat : function(seconds){
		var m=Math.floor(seconds/60)<10?"0"+Math.floor(seconds/60):Math.floor(seconds/60);
		var s=Math.floor(seconds-(m*60))<10?"0"+Math.floor(seconds-(m*60)):Math.floor(seconds-(m*60));
		return m+":"+s;
	},
			
	/**/
	seekUpdate : function() {
		var currenttime = $(this.options.selector).attr('currentTime');
		if(!this.seeksliding){ 
			this.video_seek.slider('value', currenttime); 
		}
		this.video_timer.text(this.timeFormat(currenttime));							
	},

	/**/	
	errorHandling : function(e) {
	  	//$('#debug').append('Error - Media Source not supported: '+ this.video.error.code == this.video.error.MEDIA_ERR_SRC_NOT_SUPPORTED); // true
	 		//$('#debug').append('Error - Network No Source: '+ this.video.networkState == this.video.NETWORK_NO_SOURCE); // true
	},
	



	
	
	/** INTERFACES *************************/
	/**/
	play : function(){
		if($(this.options.selector).attr('paused') == false) {
			this.video.pause();					
		} else {					
			this.video.play();				
		}
	},
	
	/**/
	pause : function(){
		this.video.pause();
	},
	
	/**/	
	duration : function(){
		return $(this.options.selector).attr('duration');
	},
	
	/**/
	currentTime : function(x){
		if(x == null){ 
			return $(this.options.selector).attr('currentTime');
		}else{
			$(this.options.selector).attr('currentTime', x);
		}
	},
	
	/**/
	width : function(x){
		if(x == null){ 
			return this.video.width;
		}else{
			this.video.width = x;
		}
	},
	
	/**/
	height : function(x){
		if(x == null){ 
			return this.video.height;
		}else{
			this.video.height = x;
		}
	},
	
	/**/
	playbackRate : function(x){
		if(x == null){ 
			return this.video.playbackRate;
		}else{
			this.video.video.playbackRate = x;
		}
	},
	
	
	

	
	
	
	
	

/*????????????????*/
	playorpause : function() {
		if(this.video.ended || this.video.paused) {
			this.video.play();					
		} else {					
			this.video.pause();				
		}
	},





}); // end video class
























