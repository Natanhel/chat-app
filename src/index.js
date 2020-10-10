const express = require('express')
const http = require('http')
const path = require("path")
// const hbs = require("hbs")
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, "/../public")

// Setup static directory to server
app.use(express.static(publicDirPath))

// Consts
const adminName = 'Mr Admin Bot'

io.on('connection', (socket) => {
    console.log('New WebSocket connection')    

    socket.on('join', (options, cb) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return cb(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(adminName, 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(adminName, `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        cb()
    })

    socket.on('sendMessage', (msg, cb) => {
        const user = getUser(socket.id)
        if (!user) {
            return cb('No such a user found!')
        }
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return cb('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg) )
        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(adminName, `${user.username} has left the room.`))            
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (coords, cb) => {
        const user = getUser(socket.id)
        if (!user) {
            return cb('No such a user found!')
        }
        // console.log(coords);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords))
        cb()
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
