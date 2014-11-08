var express = require('express'),
    swig = require('swig'),
    request = require('request');
var app = express();

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');

app.use(express.static('./public'));

app.get('/', function(req, res){
    res.render('index');
})

var server = app.listen(4000, function () {
    console.log('server listening on port 4000');
})

var Mopidy = require("mopidy");

var mopidy = new Mopidy({
    webSocketUrl: "ws://localhost:6680/mopidy/ws/"
                   });

var io = require('socket.io')(server);

function Player(){
    
    return {

        status: {
            'now_playing' : null,
            'error_offline_msg' : "Music Server is offline",
            'playbackstatus':''
        },
        queue: [],
        pause: function(){
	    this.status.playbackstatus = 'PAUSED';
	    mopidy.playback.pause();
        },
        play: function(track){
	    this.status.playbackstatus = 'PLAYING';
	    mopidy.playback.play();
	    
        },
        playpause: function(req, res){
	    if(this.status.playbackstatus == "PLAYING"){
	        this.pause();
	    }else{
	        this.play();
	    }
        },
        
	check4dup : function(uri){

	    for (var x in this.queue) {
		if(this.queue[x].uri === uri) return true
	    }

	    return false;

	},
	getArt : function(p_track){

	    request({
		uri: "https://embed.spotify.com/oembed/?url="
                    + p_track.uri,
		method: "GET",
		headers: {
		    'User-Agent': 'Mozilla/5.0 '
                        + '(Windows NT 6.1; Win64; x64; rv:25.0) '
                        + 'Gecko/20100101 Firefox/25.0'
		}
	    }, function(error, response, body) {
		
		var response = JSON.parse(body);
		var album_art_640 = function(str){
		    str = str.split('cover');
		    return str[0]+'640'+str[1];
		}(response.thumbnail_url);

		p_track.album.art = album_art_640;

		// p_callback.apply(self,[error,p_track]);
		
		
	    });

	}
    };
}

var player = new Player();

io.on('connection', function(socket){
  // console.log('a user connected');
  
    socket.on('disconnect', function(){
        // console.log('user disconnected');
    });

    socket.on('search', function(term){

        // console.log('search')
        mopidy.library.search({any:[term]}, ['spotify:']).then(function(data){
            // console.log("data", data)

            socket.emit('result', data);

        });
        
    });

    
    socket.on('playpause', function(action){
        console.log('1;');
        player.playpause();
        socket.broadcast.emit('playpause');
    });
    
    socket.on('add', function (track) {
        var trackURI = track.uri;
        console.log('uri' + trackURI);
        mopidy.library.lookup(trackURI).then(function(trackToPlay) {
            // mopidy.tracklist.clear();

            socket.broadcast.emit('new', track);
            // socket.emit('new', track);
            
            console.log(track);
            mopidy.tracklist.add(trackToPlay);
	    if(this.status.playbackstatus != "PLAYING"){
                player.play();
            }
        });
    });
    
});



// var uri = data[0].tracks[0].uri
// console.log('uri', uri)

// mopidy.library.lookup(uri).then(function(track) {
            
//   mopidy.tracklist.clear();

//   mopidy.tracklist.add(track);
      
//   play();
      
// });
// function play(){
//   mopidy.playback.play()
  
//   setTimeout(function () {
//     // mopidy.playback.pause()
//   }, 10000)
// }
