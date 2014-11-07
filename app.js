var express = require('express'),
    swig = require('swig');
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
        }
    };
}

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

    var player = new Player();
    
    socket.on('playpause', function(action){
        player.playpause();
    });
    
    socket.on('add', function (song) {
        console.log(song)
        socket.broadcast.emit('new', song);
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
