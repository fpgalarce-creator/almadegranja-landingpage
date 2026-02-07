const { readProducts } = require('../../server/utils/storage')

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Método no permitido' })
    return
  }
  const products = await readProducts()
  res.status(200).json(products.filter((product) => product.isFeatured))
}
