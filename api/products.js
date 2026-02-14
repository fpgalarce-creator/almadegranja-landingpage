const { getProducts } = require('../server/utils/storage')

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Método no permitido' })
    return
  }

  try {
    const products = await getProducts()
    res.status(200).json(products)
  } catch (error) {
    console.error('products error', error)
    res.status(500).json({ message: error?.message || 'Error al obtener productos.' })
  }
}
