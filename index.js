const express = require ('express')
const cors = require('cors')
const app = express()
const server = require('http').createServer(app)
const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient()

app.use(cors())
app.use(express.json({extended: true}))

const port = process.env.port || 4000

app.post('/users', async (req, res) => {

    const {name, email, role} = req.body

    try {
        const user = await prisma.user.create({
            data:{
                name, email, role
            }
        })
        return res.json(user)
    } catch (err) {
        console.log(err)
    }
})

app.post('/posts', async (req, res) => {

    const {titulo, body, uuidUser, imagenes} = req.body
    
    try {
        const post = await prisma.post.create({
            data:{ titulo, body, user:{ connect: {uuid: uuidUser}}}
        })
        
        const postId = post.id
        const uuidPost = post.uuid
        
        imagenes.map( async (imagen) => {
            let { tipo, img } = imagen
            console.log(tipo)
            await prisma.imagen.create({ 
                data: {tipo, ruta:img,  post:{ connect: {uuid: uuidPost}}}
            })
        })

        const dataPost = await prisma.post.findMany({
            where: { id: postId },
            include: { 
                user: true,
                imagenes: true,
            },
        })
        return res.json(dataPost)
    } catch (err) {
        console.log(err)
    }
})
app.use('/public/files', cors(), express.static('public/files'))
app.use('/api/productos', require('./routes/productos'))
app.use('/api/usuarios', require('./routes/usuarios'))
app.use('/api/auth', require('./routes/auth'));

server.listen(port, async () => {
    console.log(`puerto ${port}`)
})
