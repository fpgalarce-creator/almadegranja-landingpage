const parseJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  const raw = Buffer.concat(chunks).toString('utf-8')
  try {
    return JSON.parse(raw)
  } catch (error) {
    return {}
  }
}

module.exports = { parseJsonBody }
