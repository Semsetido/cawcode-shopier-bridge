import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();
app.use(express.json());

const { SHOPIER_KEY, SHOPIER_SECRET } = process.env;

// Ana test sayfası
app.get("/", (req, res) => {
  res.send("Cawcode Shopier Bridge Çalışıyor 🚀");
});

// Ödeme oluşturma route'u
app.get("/create-payment", async (req, res) => {
  try {
    const { order_id, amount, buyer_name, buyer_email, buyer_address } = req.query;

    if (!order_id || !amount || !buyer_name || !buyer_email || !buyer_address) {
      return res.status(400).send("Eksik parametre var!");
    }

    const signature = crypto
      .createHmac("sha256", SHOPIER_SECRET)
      .update(`${order_id}${amount}`)
      .digest("hex");

    const response = await axios.post("https://www.shopier.com/api/v1/init", {
      API_key: SHOPIER_KEY,
      order_id,
      amount,
      buyer_name,
      buyer_email,
      buyer_address,
      signature,
      callback_url: "https://www.cawcode.com/payment-success"
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (response.data && response.data.payment_url) {
      return res.redirect(response.data.payment_url); // direkt yönlendir
    } else {
      return res.status(500).send("Shopier yanıtı geçersiz!");
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send("Payment route hata verdi!");
  }
});

app.listen(3000, () => console.log("Bridge çalışıyor 🚀"));
