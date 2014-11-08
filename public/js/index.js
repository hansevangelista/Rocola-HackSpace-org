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
        
        console.log( trackList );

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
    
    socket.on('playpause', function(){
        console.log('2');

        $('.musicbar').toggleClass('animate');
        $('.play').fadeToggle();
    });
    
    socket.on('firstPlaylist', function(data){
        var len = data.length;
        for( var i = 0 ; i < len; i++){
            $('.playlist').append(track1Template(data[i]));
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
