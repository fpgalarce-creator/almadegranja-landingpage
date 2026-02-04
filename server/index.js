const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const { readProducts, writeProducts } = require('./utils/storage')
const crypto = require('crypto')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(express.json())
const createToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' })

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/products', async (req, res) => {
  const products = await readProducts()
  res.json(products)
})

app.get('/api/admin/products', authMiddleware, async (req, res) => {
  const products = await readProducts()
  res.json(products)
})

app.post('/api/admin/products', authMiddleware, async (req, res) => {
  const products = await readProducts()
  const newProduct = {
    id: crypto.randomUUID(),
    category: req.body.category,
    title: req.body.title,
    description: req.body.description || '',
    price: Number(req.body.price),
    unit: req.body.unit || '',
    imageUrl: req.body.imageUrl || '',
    createdAt: new Date().toISOString()
  }
  products.push(newProduct)
  await writeProducts(products)
  res.status(201).json(newProduct)
})

app.delete('/api/admin/products/:id', authMiddleware, async (req, res) => {
  const products = await readProducts()
  const updated = products.filter((product) => product.id !== req.params.id)
  await writeProducts(updated)
  res.status(204).send()
})

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }
  const token = createToken({ username })
  return res.json({ token })
})

app.post('/api/admin/cloudinary/signature', authMiddleware, (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const folder = process.env.CLOUDINARY_FOLDER

  if (!apiSecret || !apiKey || !cloudName) {
    return res.status(500).json({ message: 'Cloudinary no configurado' })
  }

  const signatureBase = `timestamp=${timestamp}${folder ? `&folder=${folder}` : ''}${apiSecret}`
  const signature = crypto.createHash('sha1').update(signatureBase).digest('hex')

  return res.json({ signature, timestamp, cloudName, apiKey, folder })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
