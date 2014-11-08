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
            'playbackstatus':'PAUSED'
        },
        queue: [],
        current_track: null,
        
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

            console.log(p_track.uri);
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

		p_track.albumArt = album_art_640;

                // console.log(p_track.albumArt)


		// p_callback.apply(self,[error,p_Track]);
		
		
	    });

	},
        lookupAndPlay: function(p_track){

	    if (typeof p_track === 'undefined') return;

	    this.current_track = p_track;


	    mopidy.library.lookup(p_track.uri).then(function(track) {
	        
		mopidy.tracklist.clear();

		mopidy.tracklist.add(track);
	        
		this.play();
	        
	    });
	},
        _playbackStarted: function(track){

	    this.status.now_playing = track;

	    // self.emit('playback:started', track);

	    console.log('playback:started');
	},

        _playbackEnded: function(lastTrack){

	    // if(self.bomb_switch) {
	    //     return;
	    // }

	    // if(this.queue[0]) {

	    //     var to_be_played = this.queue.shift();

	    //     this.lookupAndPlay(to_be_played);

	    //     // this.emit('playback:queue', self.util.buildPlaylist() );

	    //     console.log('playback:queue');

	    // } else {
	    //     this.status.now_playing = null;

	    //     if(this.current_track.uri == lastTrack.tl_track.track.uri){
	    //         this.current_track = null;
	    //         this.loadDefaultPlayList();
	    //     }
	    //     // self.emit('playback:queue', self.util.buildPlaylist() );

	    // }
            console.log( 'chucha acabo una cancion \n' );

        }

    };
}

var player = new Player();

// mopidy.on('event:trackPlaybackStarted', player._playbackStarted.bind(this));
// mopidy.on('event:trackPlaybackEnded', player._playbackEnded.bind(this));


io.on('connection', function(socket){
    

    // console.log(mopidy.playback.get)
    socket.emit('firstPlaylist', player);


    socket.on('search', function(term){

        // console.log('search')
        mopidy.library.search({any:[term]}, ['spotify:']).then(function(data){
            
            var trackList = {};
            
            for( var i = 0; i < 10 ; i++){
                var uri = data[0].tracks[i].uri;
                trackList[uri] = {
                    name: data[0].tracks[i].name,
                    album: data[0].tracks[i].album.name,
                    albumArt: null,
                    uri: uri
                };
                player.getArt(trackList[uri]);
            }

            
            setTimeout(function () {
                console.log( "----------------------------" );
                console.log( "------- SERVER -------------" );
                console.log( "----------------------------" );

                socket.emit('result', trackList);
                console.log(trackList);
                
                console.log( "----------------------------" );
                console.log( "------- END SERVER ---------" );
                console.log( "----------------------------" );
            }, 2000);

        });
        
    });

    var printCurrentTrack = function (track) {
        if (track) {
            console.log("Currently playing:", track.name, "by",
                        track.artists[0].name, "from", track.album.name);
        } else {
            console.log("No current track");
        }
    };

    socket.on('playpause', function(action){
        console.log('1;');
        player.playpause();
        socket.broadcast.emit('playpause', player.status.playbackstatus);
        
        mopidy.playback.getCurrentTrack()
            .done(printCurrentTrack);
    });
    
    socket.on('add', function (track) {
        var trackURI = track.uri;
        console.log( track );

        // console.log('uri' + trackURI);
        mopidy.library.lookup(trackURI).then(function(trackToPlay) {

            // mopidy.playlists.getPlaylists().then(function(playlists){
            //     var playlist = playlists;
            //     console.log('holi ' + playlists);
            // });
                                                 

            socket.broadcast.emit('new', track);
            player.queue.push(track);
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
