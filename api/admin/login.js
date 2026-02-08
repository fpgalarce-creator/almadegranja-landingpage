const jwt = require('jsonwebtoken')
const { parseJsonBody } = require('../_utils/body')

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  try {
    console.log('login hit', req.method)
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Método no permitido' })
      return
    }

    const body = await parseJsonBody(req)
    const { username, password } = body || {}
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(401).json({ message: 'Credenciales inválidas' })
      return
    }

    const isProduction = process.env.NODE_ENV === 'production'
    const adminUser = process.env.ADMIN_USERNAME || 'admin'
    const adminPass = process.env.ADMIN_PASSWORD || 'admin'
    const jwtSecret = process.env.JWT_SECRET || (!isProduction ? 'dev_secret_almadegranja' : null)

    if (
      isProduction &&
      (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET)
    ) {
      console.error('admin/login error', {
        message: 'Missing required ENV vars',
        hasAdminUsername: Boolean(process.env.ADMIN_USERNAME),
        hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
        hasJwtSecret: Boolean(process.env.JWT_SECRET)
      })
      res.status(500).json({ message: 'Configuración incompleta en servidor (ENV).' })
      return
    }

    if (username !== adminUser || password !== adminPass) {
      res.status(401).json({ message: 'Credenciales inválidas' })
      return
    }

    if (!jwtSecret) {
      console.error('admin/login error', { message: 'Missing JWT_SECRET' })
      res.status(500).json({ message: 'Configuración incompleta en servidor (ENV).' })
      return
    }

    const token = jwt.sign({ username }, jwtSecret, { expiresIn: '2h' })
    res.status(200).json({ token })
  } catch (error) {
    console.error('admin/login error', error)
    res.status(500).json({ message: 'Configuración incompleta en servidor (ENV).' })
  }
}
