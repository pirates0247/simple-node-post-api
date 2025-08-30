import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(bodyParser.json());

// Save orders temporarily in memory
let orders = [];

// API to place order
app.post("/api/orders", (req, res) => {
  const { products, totalCostCents } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  // Construct the order object
  const newOrder = {
    id: uuidv4(),
    orderTime: new Date().toISOString(),
    products: products.map(p => ({
      productId: p.productId,
      quantity: p.quantity || 1
    })),
    totalPrice: totalCostCents // coming from frontend
  };

  orders.push(newOrder);

  console.log("Order saved:", newOrder);

  res.status(201).json(newOrder);
});

// API to fetch all orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
