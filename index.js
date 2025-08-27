import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();
app.use(express.json());

const SHOPIER_KEY = process.env.SHOPIER_KEY;
const SHOPIER_SECRET = process.env.SHOPIER_SECRET;

// Shopify sipariş sonrası yönlendirme endpointi
app.post("/create-payment", async (req, res) => {
  try {
    const { order_id, buyer_name, email, amount, product_name } = req.body;

    // Shopier imza
    const dataToSign = `${SHOPIER_KEY}${order_id}${amount}${buyer_name}`;
    const signature = crypto
      .createHmac("sha256", SHOPIER_SECRET)
      .update(dataToSign)
      .digest("hex");

    // Shopier ödeme başlatma
    const response = await axios.post("https://www.shopier.com/api/v1/init", {
      API_key: SHOPIER_KEY,
      order_id,
      amount,
      buyer_name,
      email,
      product_name,
      signature,
      callback_success_url: "https://seninsiten.com/success",
      callback_fail_url: "https://seninsiten.com/fail",
    });

    const payment_url = response.data.payment_url;

    // 🔥 Müşteri direkt ödeme sayfasına yönlendirilsin
    return res.redirect(payment_url);

  } catch (err) {
    console.error("Payment error:", err.response?.data || err.message);
    return res.status(500).send("Ödeme başlatılamadı.");
  }
});

// Test için basit endpoint
app.get("/", (req, res) => {
  res.send("Cawcode - Shopier Bridge Çalışıyor 🚀");
});

// Sunucu
app.listen(3000, () => console.log("Bridge up on port 3000 🚀"));
