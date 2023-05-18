// DESAFIO ENTREGABLE -  Websockets + Handlebars - ANDRADE MATIAS 
const express = require('express')
const path = require('path')
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json())


//Http import
const http = require('http')
const server = http.createServer(app)

//Import Routes
app.use('/api', require('./routes/products'))
app.use('/api', require('./routes/carts'))
app.use('/images', require('./routes/multer'))


//Socket Import
const { Server } = require('socket.io')
const io = new Server(server)

//Public
app.use(express.static("public"))

//View Dependencies
const handlebars = require('express-handlebars')
const ProductManager = require('./ProductManager')
const controllerProduct = new ProductManager();

//Views
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

//Connection
io.on('connection', (socket) => {
    console.log('New user connected in App')
    socket.emit('Welcome', 'Hello, welcome new user')
    socket.on('productDeleted', async (data) => {
        console.log(data)
        await controllerProduct.deleteProduct(data.id)
        const products = await controllerProduct.getProducts()
        socket.emit('refreshproducts', products)
    })

    socket.on('productAdd', async (data) => {
        const respuesta = await controllerProduct.addProduct(data.title, data.description, data.price, data.code, data.stock, data.category, data.thumbnail, data.status)
        socket.emit('answer', respuesta)
        const products = await controllerProduct.getProducts()
        socket.emit('refreshproducts', products)
    })

})


const PORT = 8080 || process.env.PORT
server.listen(PORT, () => {
    console.log(`Server run on port http://localhost:${PORT}`)
})