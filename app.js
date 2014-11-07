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

var server = app.listen(3000, function () {
	console.log('server listening on port 3000')
})

var Mopidy = require("mopidy");

var mopidy = Mopidy({
    webSocketUrl: "ws://localhost:6680/mopidy/ws/"
});

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

      socket.emit('result', data)

    });

    // socket.broadcast.emit('new song', song);

  });
});
