const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const app = express()
const proyecto = require('./archivo.js');
const fs =require('fs');
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

let contenedorProductos = new proyecto.Contenedor("productos.txt");
let contenedorMensajes = new proyecto.Contenedor("mensajes.txt");
const messages = [];
const productos = [];

app.use(express.static('./public'))
app.use(express.urlencoded({extended:true}))
app.set('views', './public')

app.set('view engine', 'pug')
app.get('/', (req, res) => {
    // res.sendFile('index.pug', {root: __dirname})
    res.render('./views/mensajes')
})

io.on('connection', async (socket) => {
    console.log('Un cliente se ha conectado!')

    // socket.emit('messages', messages)
    socket.emit('messages', await contenedorMensajes.getAll())

    socket.on('new-message', async data => {
        // messages.push(data)
        await contenedorMensajes.save(data);
        io.sockets.emit('messages', await contenedorMensajes.getAll())
    })
    // socket.emit('products', productos)
    socket.emit('products', await contenedorProductos.getAll())

    socket.on('new-product', async data => {
        // productos.push(data)
        await contenedorProductos.save(data);
        io.sockets.emit('products', await contenedorProductos.getAll())
    })
})

const PORT = process.env.PORT || 8080

httpServer.listen(PORT, () => console.log('Iniciando en el puerto: ' + PORT))