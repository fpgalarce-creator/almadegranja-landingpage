const { v2: cloudinary } = require('cloudinary')
const formidable = require('formidable')
const fs = require('fs/promises')
const { requireAuth } = require('../_utils/auth')

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false })
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ fields, files })
    })
  })

module.exports = async (req, res) => {
  const user = requireAuth(req, res)
  if (!user) return

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Método no permitido' })
    return
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const folder = process.env.CLOUDINARY_FOLDER

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(500).json({ message: 'Cloudinary no configurado' })
    return
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  })

  try {
    const { files } = await parseForm(req)
    const file = files.file
    const filePath = Array.isArray(file) ? file[0]?.filepath : file?.filepath

    if (!filePath) {
      res.status(400).json({ message: 'Archivo inválido' })
      return
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder
    })

    await fs.unlink(filePath).catch(() => {})
    res.status(200).json({ url: uploadResult.secure_url })
  } catch (error) {
    res.status(500).json({ message: 'No se pudo subir la imagen' })
  }
}
