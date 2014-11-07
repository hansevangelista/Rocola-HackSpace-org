$(document).ready(function () {
	
    window.mpagesContainer = new MPages(document.querySelector('.wraper'), {
	timeSlide: 500,
	initPage: 1
    });

    var socket = io();

    var tracks = $('.tracks');
    var artists = $('.artists');

	var trackTemplate = _.template($("#track").html())
	var artistTemplate = _.template($("#artist").html())
	var track1Template = _.template($("#track1").html())
	
	// $('.input').change(function () {
	// 	console.log('change')
	// })

	$('.input').keyup(function (e) {
		// console.log('keyup')
	    if (e.keyCode == 13) {
	    	// console.log('enter')
			socket.emit('search', $('.input').val())
			$('.result').css('display', 'block')
			tracks.html("")
			artists.html("")
	    }
	});
    socket.on('result', function (result) {

		// console.log('result', result[0].tracks[0].uri)

	for (var i = 0; i < 3; i++) {

			var track = {
				name: result[0].tracks[i].name,
				album: result[0].tracks[i].album.name,
				uri: result[0].tracks[i].uri
			}

			var artist = {
				name: result[0].artists[i].name
			}

			$('.tracks').append(trackTemplate(track))
			$('.artists').append(artistTemplate(artist))
		}

		socket.emit('add', track)
	})

	socket.on('new', function (track) {
		console.log(track)

		$('.playlist').append(track1Template(track))
	})

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
