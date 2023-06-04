//library
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { addUsers,removeUser, getUser} = require("./entity");

//Instances
const app = express();
const server = http.createServer(app);
const io = socketio(server,{cors:{origin:'*'}});

//end point
app.get('/',(req,res)=>{
    res.json("Api is successfully running");
})

//socket
io.on('connect',(socket)=>{
    console.log("User Connected");
    socket.on('join',({name,room},callBack)=>{
        console.log(name,room);
        const {user,error} = addUsers({id:socket.id,name:name,room:room})
        if (error){
            callBack(error)
            return;
        }
        socket.join(user.room);
        socket.emit('message',{user:'admin',text:`Welcome ${user.name}`});
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has Joined`});
        // io.to(response.room).emit('roomMembers', getRoomUsers(response.room))

    })


    socket.on('sendMsg',(message,callBack)=>{
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:user.name,text:message})
        }
        callBack();  
    })

    socket.on('disconnect',()=>{
        console.log("User Disconnected"); 
        const user = removeUser(socket.id);
        
        if(user){
            io.to(user.room).emit('message',{user:"admin",text:`user ${user.name} has left`})
        }
    })
})

//run server
server.listen(8000,()=> console.log("Server started on 8000"))