const { ADMIN_USER, ADMIN_PASS, createToken } = require('../_utils/auth')
const { parseJsonBody } = require('../_utils/body')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Método no permitido' })
    return
  }

  const body = await parseJsonBody(req)
  const { username, password } = body
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    res.status(401).json({ message: 'Credenciales inválidas' })
    return
  }

  const token = createToken({ username })
  res.status(200).json({ token })
}
