const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
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
app.use(cookieParser())

const createToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' })

const authMiddleware = (req, res, next) => {
  const token = req.cookies.auth_token
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
  res.json(products.filter((product) => product.active))
})

app.get('/api/admin/products', authMiddleware, async (req, res) => {
  const products = await readProducts()
  res.json(products)
})

app.post('/api/admin/products', authMiddleware, async (req, res) => {
  const products = await readProducts()
  const newProduct = {
    id: crypto.randomUUID(),
    name: req.body.name,
    category: req.body.category,
    price: Number(req.body.price),
    unit: req.body.unit,
    imageUrl: req.body.imageUrl || '',
    active: Boolean(req.body.active)
  }
  products.push(newProduct)
  await writeProducts(products)
  res.status(201).json(newProduct)
})

app.put('/api/admin/products/:id', authMiddleware, async (req, res) => {
  const products = await readProducts()
  const index = products.findIndex((product) => product.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' })
  }
  products[index] = {
    ...products[index],
    name: req.body.name,
    category: req.body.category,
    price: Number(req.body.price),
    unit: req.body.unit,
    imageUrl: req.body.imageUrl || '',
    active: Boolean(req.body.active)
  }
  await writeProducts(products)
  return res.json(products[index])
})

app.delete('/api/admin/products/:id', authMiddleware, async (req, res) => {
  const products = await readProducts()
  const updated = products.filter((product) => product.id !== req.params.id)
  await writeProducts(updated)
  res.status(204).send()
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }
  const token = createToken({ username })
  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 2 * 60 * 60 * 1000
  })
  return res.json({ username })
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token')
  res.status(200).json({ message: 'ok' })
})

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.auth_token
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return res.json({ username: decoded.username })
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
