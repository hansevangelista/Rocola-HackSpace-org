var express = require('express'),
	swig = require('swig')
var app = express()

app.engine('html', swig.renderFile)
app.set('view engine', 'html')
app.set('views', __dirname + '/app/views')

app.use(express.static('./public'))

app.get('/', function(req, res){
	res.render('index')
})

var server = app.listen(4000, function () {
	console.log('server listening on port 4000')
})

var Mopidy = require("mopidy");

var mopidy = Mopidy({
    webSocketUrl: "ws://localhost:6680/mopidy/ws/"
});

function play(){
  mopidy.playback.play()
  
  setTimeout(function () {
    mopidy.playback.pause()
  }, 10000)
}

var io = require('socket.io')(server)

io.on('connection', function(socket){
  // console.log('a user connected');
  
  socket.on('disconnect', function(){
    // console.log('user disconnected');
  });

  socket.on('search', function(song){

    // console.log('search')

    mopidy.library.search({any:[song]}, ['spotify:']).then(function(data){
      // console.log("data", data)

      var uri = data[0].tracks[0].uri
      console.log('uri', uri)

      mopidy.library.lookup(uri).then(function(track) {
            
        mopidy.tracklist.clear();

        mopidy.tracklist.add(track);
      
        play();
      
      });

      socket.emit('result', data)

    });

    // socket.broadcast.emit('new song', song);

  });
});
