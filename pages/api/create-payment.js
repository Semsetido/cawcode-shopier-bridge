import crypto from "crypto";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Sadece GET destekleniyor" });
  }

  const { order_id, amount, buyer_name, buyer_email, buyer_address } = req.query;

  if (!order_id || !amount || !buyer_name || !buyer_email || !buyer_address) {
    return res.status(400).json({ error: "Eksik parametre var" });
  }

  try {
    const signature = crypto
      .createHmac("sha256", process.env.SHOPIER_SECRET)
      .update(`${order_id}${amount}`)
      .digest("hex");

    const response = await axios.post(
      "https://www.shopier.com/api/v1/init",
      {
        API_key: process.env.SHOPIER_KEY,
        order_id,
        amount,
        buyer_name,
        buyer_email,
        buyer_address,
        signature,
        callback_url: "https://www.cawcode.com/payment-success"
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    if (response.data && response.data.payment_url) {
      return res.redirect(response.data.payment_url);
    } else {
      return res.status(500).json({ error: "Shopier geçersiz yanıt döndü" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Payment route hata verdi" });
  }
}
