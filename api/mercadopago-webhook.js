export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { type, data } = req.body
  console.log(`Webhook recibido: type=${type}`, data?.id ? `id=${data.id}` : "")
  res.sendStatus(200)
}
