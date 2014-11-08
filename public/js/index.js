var trackList ={};

$(document).ready(function () {
    
    window.mpagesContainer = new MPages(document.querySelector('.wraper'), {
	timeSlide: 500,
	initPage: 1
    });

    var socket = io();

    var tracks = $('.tracks');
    var artists = $('.artists');

    var trackTemplate = _.template($("#track").html());
    // var artistTemplate = _.template($("#artist").html());
    var track1Template = _.template($("#track1").html());
    
    $('.input').change(function () {
	console.log('change');
    });
    
    $('.song').click(function(){
        socket.emit('playpause', "");  
        $('.musicbar').toggleClass('animate');
        $('.play').fadeToggle();
    });

    $('.input').keyup(function (e) {
	console.log('keyup');
	if (e.keyCode == 13) {
	    console.log('enter');
	    
	    socket.emit('search', $('.input').val());
	    $('.result').css('display', 'block');
	    tracks.html("");
	    artists.html("");
	}
    });


    socket.on('result', function (result) {
        
        trackList = result;
        
        for (var track in trackList){
    	    $('.tracks').append(trackTemplate(trackList[track]));
        }
        
        $('.addTrackButton').unbind('click');
        $('.addTrackButton').one('click',function(event) {
            var selectedTrackUri = this.getAttribute('data-spotify-uri');
            
            console.log('jojo', selectedTrackUri);
            console.log( trackList );

            
            var trackObject = trackList[selectedTrackUri];

	    socket.emit('add', trackObject);
            
            $('.playlist').append(track1Template(trackObject));

            $(this).children().children('.fa-check').toggle();
            $(this).children().children('.fa-plus').toggle();
        });

        // $('.addTrackButton').click(function(event){

        // });

    });

    socket.on('new', function (track) {
	console.log(track);
	$('.playlist').append(track1Template(track));
    });
    
    socket.on('playpause', function(status){
        console.log("SOLO");
        if (status == "PLAYING"){
            $('.musicbar').addClass('animate');
            $('.play').fadeOut();
        }
        else if (status == "PAUSED"){
            $('.musicbar').removeClass('animate');
            $('.play').fadeIn();
        }
    });
    

    
    socket.on('firstPlaylist', function(player){
        var queue = player.queue;
        // here goes the rendering 
        // of the initial almbum and shift one track

        for( var i = 0 ; i < queue.length; i++){
            $('.playlist').append(track1Template(queue[i]));
        }
        
        if ( player.queue.length == 1){
        var status = player.status.playbackstatus;
        if ( status == "PLAYING"){
            $('.musicbar').addClass('animate');
            $('.play').fadeOut();
        }
        else if (status == "PAUSED"){
            $('.musicbar').removeClass('animate');
            $('.play').fadeIn();
        }
        $('.bomb').click(function(e){
            e.stopPropagation(); 
            socket.emit('next');
        });
            
        }
    });

    /* Swipes */

    $('.wraper').on("swiperight", function () {
	$('.player').css('transform', 'translate(' +  0 + '%, 0) translateZ(0)');
	$('.search').css('transform', 'translate(' +  0 + '%, 0) translateZ(0)');
    });

    $('.wraper').on("swipeleft", function () {
	$('.player').css('transform', 'translate(' +  -100 + '%, 0) translateZ(0)');
	$('.search').css('transform', 'translate(' +  -100 + '%, 0) translateZ(0)');
    });
});
