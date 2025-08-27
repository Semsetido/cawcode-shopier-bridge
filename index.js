import express from "express";
import crypto from "crypto";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SHOPIER_KEY = process.env.SHOPIER_KEY;
const SHOPIER_SECRET = process.env.SHOPIER_SECRET;

app.get("/", (req, res) => {
  res.send("Cawcode Shopier Bridge Çalışıyor 🚀");
});

// Shopify siparişten Shopier ödeme oluşturma
app.post("/create-payment", async (req, res) => {
  try {
    const { order_id, amount, buyer_name, buyer_email, buyer_address } = req.body;

    // Shopier imzalama
    const signature = crypto
      .createHmac("sha256", SHOPIER_SECRET)
      .update(`${SHOPIER_KEY}${order_id}${amount}`)
      .digest("hex");

    // Shopier API çağrısı
    const response = await axios.post(
      "https://www.shopier.com/api/v1/init",
      {
        API_key: SHOPIER_KEY,
        signature: signature,
        order_id: order_id,
        amount: amount,
        buyer_name: buyer_name,
        buyer_email: buyer_email,
        buyer_address: buyer_address,
        success_url: "https://www.cawcode.com/thank-you", // ödeme başarılı olursa
        fail_url: "https://www.cawcode.com/payment-failed" // ödeme başarısız olursa
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // Shopier ödeme linkine yönlendirme
    const payment_url = response.data.payment_url;
    return res.redirect(payment_url);

  } catch (error) {
    console.error("Shopier hata:", error.message);
    res.status(500).send("Ödeme başlatılamadı!");
  }
});

app.listen(3000, () => console.log("Bridge up on 3000 🚀"));
