
$(document).ready(function () {
	
	window.mpagesContainer = new MPages(document.querySelector('.wraper'), {
		timeSlide: 500,
		initPage: 1
	})

	var socket = io()

	var tracks = $('.tracks')
	var artists = $('.artists')

	var trackTemplate = _.template($("#track").html())
	var artistTemplate = _.template($("#artist").html())

	$('.submit').click(function () {
		socket.emit('search', $('.input').val())
	})
	
	$('.input').change(function () {
		console.log('change')
	})

	$('.input').keyup(function (e) {
		console.log('keyup')
	    if (e.keyCode == 13) {
	    	console.log('enter')
	    	
			socket.emit('search', $('.input').val())
			$('.result').css('display', 'block')
			tracks.html("")
			artists.html("")
	    }
	});

	socket.on('result', function (result) {

		for (var i = 0; i < 3; i++) {

			var track = {
				name: result[0].tracks[i].name,
				album: result[0].tracks[i].album.name
			}

			var artist = {
				name: result[0].artists[i].name
			}

			$('.tracks').append(trackTemplate(track))
			$('.artists').append(artistTemplate(artist))
		}
	})

    $('.wraper').on("swiperight", function () {
		$('.player').css('transform', 'translate(' +  0 + '%, 0) translateZ(0)')
		$('.search').css('transform', 'translate(' +  0 + '%, 0) translateZ(0)')
    })

    $('.wraper').on("swipeleft", function () {
		$('.player').css('transform', 'translate(' +  -100 + '%, 0) translateZ(0)')
		$('.search').css('transform', 'translate(' +  -100 + '%, 0) translateZ(0)')
    })
})