const crypto = require('crypto')
const { readProducts, writeProducts } = require('../../server/utils/storage')
const { requireAuth } = require('../_utils/auth')
const { parseJsonBody } = require('../_utils/body')

module.exports = async (req, res) => {
  console.log('admin products hit', req.method)
  const user = requireAuth(req, res)
  if (!user) return

  if (req.method === 'GET') {
    const products = await readProducts()
    res.status(200).json(products)
    return
  }

  if (req.method === 'POST') {
    const body = await parseJsonBody(req)
    const trimmedTitle = body.title?.trim()
    const trimmedDescription = body.description?.trim()
    const trimmedCategory = body.category?.trim()
    const priceValue = Number(body.price)

    if (!trimmedTitle || !trimmedDescription || !trimmedCategory || !Number.isFinite(priceValue)) {
      res.status(400).json({ message: 'Completa título, descripción, categoría y precio.' })
      return
    }

    const products = await readProducts()
    const newProduct = {
      id: crypto.randomUUID(),
      category: trimmedCategory,
      title: trimmedTitle,
      description: trimmedDescription,
      price: priceValue,
      unit: body.unit || '',
      imageUrl: body.imageUrl || '',
      isFeatured: Boolean(body.isFeatured),
      createdAt: new Date().toISOString()
    }

    products.push(newProduct)
    // Nota: el filesystem de Vercel no es persistente entre invocaciones.
    await writeProducts(products)
    res.status(201).json(newProduct)
    return
  }

  res.status(405).json({ message: 'Método no permitido' })
}
