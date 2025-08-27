import express from "express";
import crypto from "crypto";
import axios from "axios";

const app = express();
app.use(express.json());

const { SHOPIER_KEY, SHOPIER_SECRET } = process.env;

app.get("/", (req, res) => {
  res.send("Cawcode Shopier Bridge Çalışıyor ✅");
});

// Shopify -> Shopier yönlendirme
app.post("/create-payment", async (req, res) => {
  try {
    const { order_id, order_name, amount, currency, buyer } = req.body;

    // Shopier için imza
    const payload = `${order_id}|${amount}|${currency}`;
    const signature = crypto
      .createHmac("sha256", SHOPIER_SECRET)
      .update(payload)
      .digest("hex");

    // Shopier API isteği
    const resp = await axios.post("https://www.shopier.com/api/v1/init", {
      api_key: SHOPIER_KEY,
      signature,
      platform_order_id: order_id,
      product_name: order_name,
      product_type: 1,
      total_order_value: amount,
      currency,
      buyer_name: buyer.first_name,
      buyer_surname: buyer.last_name,
      buyer_email: buyer.email,
      buyer_phone: buyer.phone,
      billing_address: buyer.address,
      shipping_address: buyer.address,
      callback_url: `https://${req.headers.host}/callback`
    });

    const payment_url = resp.data?.payment_url;
    return res.json({ payment_url });
  } catch (e) {
    console.error(e?.response?.data || e.message);
    return res.status(500).json({ error: "create-payment failed" });
  }
});

app.listen(3000, () => console.log("Bridge up 🚀"));
