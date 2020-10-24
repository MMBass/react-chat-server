const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users');

const router = require('./router');

app.use(cors());
app.use(router);

io.on('connection',(socket)=>{
  
   socket.on('join',({name,room},cb)=>{
      const added = addUser({id:socket.id,name,room});
      
      if(added.err){
        return cb(added.err);
      }

      socket.join(added.user.room);

      socket.emit('message',{user:'admin',text: `${added.user.name} welcome to the room`});
      socket.broadcast.to(added.user.room).emit('message',{user:'admin',text: `user ${added.user.name} has joined`});
      
      io.to(added.user.room).emit('roomData', {room: added.user.room, users:getUsersInRoom(added.user.room)})

      cb();
   });

   socket.on('sendMessage',(message, cb)=>{
      const user = getUser(socket.id);

      io.to(user.room).emit('message',{user:user.name, text:message}) ;
      io.to(user.room).emit('roomData',{room:user.room, users:getUsersInRoom(user.room)}) ;
      
      cb();
   });

   socket.on('disconnect',()=>{
    const user = removeUser(socket.id);

    if(user){
       io.to(user.room).emit('message',{user:'admin',text:`user ${user.name} has left`})
    }
   });
});

server.listen(PORT, ()=> console.log(`Listening on port ${PORT}...`));