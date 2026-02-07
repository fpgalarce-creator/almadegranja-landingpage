const { readProducts, writeProducts } = require('../../../server/utils/storage')
const { requireAuth } = require('../../_utils/auth')

const getIdFromRequest = (req) => {
  if (req.query && req.query.id) return req.query.id
  const segments = req.url.split('?')[0].split('/')
  return segments[segments.length - 1]
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  const user = requireAuth(req, res)
  if (!user) return

  if (req.method !== 'DELETE') {
    res.status(405).json({ message: 'Método no permitido' })
    return
  }

  const id = getIdFromRequest(req)
  const products = await readProducts()
  const updated = products.filter((product) => product.id !== id)
  // Nota: el filesystem de Vercel no es persistente entre invocaciones.
  await writeProducts(updated)
  res.status(204).send()
}
