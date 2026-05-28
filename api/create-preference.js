import mercadopago from "mercadopago"

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || ""
const SITE_URL = process.env.SITE_URL || "https://glamours-lujan.vercel.app"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    if (!ACCESS_TOKEN) {
      return res.status(400).json({ error: "Mercado Pago no configurado" })
    }

    mercadopago.configure({ access_token: ACCESS_TOKEN })

    const { items, total, orderId, customerName, customerEmail } = req.body

    if (!items?.length || !total || !orderId) {
      return res.status(400).json({ error: "Faltan datos del pedido" })
    }

    const preference = {
      items: items.map((item, i) => ({
        id: String(i),
        title: `${item.productName} - ${item.color} / Talle ${item.size}`,
        description: `${item.brand} | ${item.color} | Talle ${item.size}`,
        quantity: Number(item.quantity),
        currency_id: "ARS",
        unit_price: Number(item.unitPrice),
      })),
      payer: {
        name: customerName || "Cliente",
        email: customerEmail || "",
      },
      back_urls: {
        success: `${SITE_URL}/api/pago-exitoso?order_id=${orderId}`,
        failure: `${SITE_URL}/api/pago-fallido?order_id=${orderId}`,
        pending: `${SITE_URL}/api/pago-pendiente?order_id=${orderId}`,
      },
      auto_return: "approved",
      external_reference: orderId,
      notification_url: `${SITE_URL}/api/mercadopago-webhook`,
      statement_descriptor: "TIENDA DE ROPA",
    }

    const mpResponse = await mercadopago.preferences.create(preference)
    res.json({
      preferenceId: mpResponse.body.id,
      initPoint: mpResponse.body.init_point,
      sandboxInitPoint: mpResponse.body.sandbox_init_point,
    })
  } catch (err) {
    console.error("Error creating preference:", err)
    res.status(500).json({ error: "Error al crear la preferencia de pago" })
  }
}
