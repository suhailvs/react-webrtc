var app = require('express')();
var fs = require('fs');
var options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
  };

var server = require('https').Server(options,app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 8080);




// // Create an HTTP service.
// http.createServer(app).listen(80);
// // Create an HTTPS service identical to the HTTP service.
// https.createServer(options, app).listen(443);


io.on('connection', function (socket) {
    socket.on('join', function (data) {
        socket.join(data.roomId);
        socket.room = data.roomId;
        const sockets = io.of('/').in().adapter.rooms[data.roomId];
        if(sockets.length===1){
            socket.emit('init')
        }else{
            if (sockets.length===2){
                io.to(data.roomId).emit('ready')
            }else{
                socket.room = null
                socket.leave(data.roomId)
                socket.emit('full')
            }
            
        }
    });
    socket.on('signal', (data) => {
        io.to(data.room).emit('desc', data.desc)        
    })
    socket.on('disconnect', () => {
        const roomId = Object.keys(socket.adapter.rooms)[0]
        if (socket.room){
            io.to(socket.room).emit('disconnected')
        }
        
    })
});
