const express = require('express');
const axios = require('axios');
const router = express.Router();
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const Product = require('../models/Product'); // <-- ADD THIS

// Setup mail transporter (use a real email and app password or SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ORDER_NOTIFY_EMAIL, // e.g. bonnielassflorals@gmail.com
    pass: process.env.ORDER_NOTIFY_PASS   // use an app-specific password
  }
});

// POST /api/payments/square
router.post('/square', async (req, res) => {
  const { sourceId, shippingAddress, items, total } = req.body;

  if (!sourceId || !total) {
    return res.status(400).json({ error: "Missing sourceId or total." });
  }

  // Square expects amount in cents
  const amount = Math.round(Number(total) * 100);

  // Unique idempotency key for each payment
  const idempotencyKey = Date.now().toString() + Math.random().toString(36).slice(2);

  try {
    // 1. Make payment with Square
    const response = await axios.post(
      'https://connect.squareup.com/v2/payments',
      {
        source_id: sourceId,
        idempotency_key: idempotencyKey,
        amount_money: {
          amount: amount,
          currency: 'USD'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 2. Save order in MongoDB after successful payment
    const order = new Order({
      items,
      total,
      shippingAddress,
      status: 'Processing',
      payment: {
        method: 'square',
        status: 'paid',
        transactionId: response.data.payment.id
      }
    });
    await order.save();

    // 2.5. Decrement stock for each product purchased
    for (const item of items) {
      if (item.product && item.quantity) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -Math.abs(item.quantity) } }
        );
      }
    }

    // 3. Send notification email to admin
    const itemsList = items.map(it => `- ${it.quantity} × ${it.product || it.productId || 'Product'}`).join('\n');
    const emailBody = `
      <h2>New Order Received</h2>
      <p><strong>Total:</strong> $${Number(total).toFixed(2)}</p>
      <p><strong>Shipping Address:</strong><br>
        ${shippingAddress.name}<br>
        ${shippingAddress.street}<br>
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br>
        ${shippingAddress.country}
      </p>
      <p><strong>Order Items:</strong><br>
        <pre>${itemsList}</pre>
      </p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Order Date:</strong> ${order.createdAt}</p>
      <p><strong>Payment Transaction ID:</strong> ${order.payment.transactionId}</p>
    `;

    await transporter.sendMail({
      from: process.env.ORDER_NOTIFY_EMAIL,
      to: process.env.ORDER_NOTIFY_EMAIL, // send to yourself/admin
      subject: `New Order Received - ${order._id}`,
      html: emailBody
    });

    res.json({ message: 'Payment successful!', payment: response.data.payment, order });
  } catch (err) {
    const errorMsg = err?.response?.data?.errors?.[0]?.detail || 'Payment failed.';
    res.status(400).json({ error: errorMsg });
  }
});

module.exports = router;
