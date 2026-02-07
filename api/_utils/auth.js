const jwt = require('jsonwebtoken')

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin'
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_almadegranja'

const createToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' })

const requireAuth = (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    res.status(401).json({ message: 'No autorizado' })
    return null
  }
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    res.status(401).json({ message: 'No autorizado' })
    return null
  }
}

module.exports = {
  ADMIN_USER,
  ADMIN_PASS,
  createToken,
  requireAuth
}
