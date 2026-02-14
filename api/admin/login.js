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

    const adminUser = process.env.ADMIN_USER
    const adminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS
    const jwtSecret = process.env.JWT_SECRET

    if (!adminUser || !adminPass || !jwtSecret) {
      console.error('admin/login error', {
        message: 'Missing required ENV vars',
        hasAdminUser: Boolean(adminUser),
        hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS),
        hasJwtSecret: Boolean(jwtSecret)
      })
      res.status(500).json({ message: 'Configuración incompleta en servidor (ENV). Revisar ADMIN_USER, ADMIN_PASSWORD (o ADMIN_PASS) y JWT_SECRET.' })
      return
    }

    if (username !== adminUser || password !== adminPass) {
      res.status(401).json({ message: 'Credenciales inválidas' })
      return
    }

    const token = jwt.sign({ username }, jwtSecret, { expiresIn: '2h' })
    res.status(200).json({ token })
  } catch (error) {
    console.error('admin/login error', error)
    res.status(500).json({ message: 'Configuración incompleta en servidor (ENV). Revisar ADMIN_USER, ADMIN_PASSWORD (o ADMIN_PASS) y JWT_SECRET.' })
  }
}
