import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

// In-memory store (clears on restart)
let orders = [];

// Save order (POST)
app.post("/orders", (req, res) => {
  const { cart, totalPrice } = req.body;
  if (!cart || !totalPrice) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newOrder = {
    id: orders.length + 1,
    cart,
    totalPrice,
    timestamp: new Date().toISOString()
  };
  orders.push(newOrder);
  res.status(201).json({
    message: "✅ Order saved successfully",
    order: newOrder
  });
});

// Get all orders (GET)
app.get("/orders", (req, res) => {
  res.json(orders);
});

// Get one order by ID (GET)
app.get("/orders/:id", (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
