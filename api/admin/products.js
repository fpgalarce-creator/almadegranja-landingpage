const crypto = require('crypto')
const { getProducts, saveProducts } = require('../../server/utils/storage')
const { requireAuth } = require('../_utils/auth')
const { parseJsonBody } = require('../_utils/body')

const parseOptionalString = (value) => {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'string') return null
  return value.trim()
}

module.exports = async (req, res) => {
  console.log('admin products hit', req.method)
  const user = requireAuth(req, res)
  if (!user) return

  try {
    if (req.method === 'GET') {
      const products = await getProducts()
      res.status(200).json(products)
      return
    }

    if (req.method === 'POST') {
      const body = await parseJsonBody(req)
      const trimmedTitle = body.title?.trim()
      const trimmedDescription = body.description?.trim()
      const trimmedCategory = body.category?.trim()
      const priceValue = Number(body.price)
      const unitValue = parseOptionalString(body.unit)
      const imageUrlValue = parseOptionalString(body.imageUrl)
      const isFeaturedIsBoolean = typeof body.isFeatured === 'boolean'

      if (!trimmedTitle || !trimmedDescription || !trimmedCategory || !Number.isFinite(priceValue)) {
        res.status(400).json({ message: 'Completa título, descripción, categoría y precio válido.' })
        return
      }

      if (unitValue === null || imageUrlValue === null || !isFeaturedIsBoolean) {
        res.status(400).json({ message: 'Campos inválidos: unit/imageUrl deben ser texto e isFeatured debe ser boolean.' })
        return
      }

      const products = await getProducts()
      const newProduct = {
        id: typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        category: trimmedCategory,
        title: trimmedTitle,
        description: trimmedDescription,
        price: priceValue,
        unit: unitValue,
        imageUrl: imageUrlValue,
        isFeatured: body.isFeatured,
        createdAt: new Date().toISOString()
      }

      products.push(newProduct)
      await saveProducts(products)
      res.status(201).json(newProduct)
      return
    }

    res.status(405).json({ message: 'Método no permitido' })
  } catch (error) {
    console.error('admin/products error', error)
    res.status(500).json({ message: error?.message || 'Error interno al gestionar productos.' })
  }
}
