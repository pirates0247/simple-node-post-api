import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

// Your delivery options array
const deliveryOptions = [
  { id: '1', deliveryDays: 7, rupees: 0 },
  { id: '2', deliveryDays: 3, rupees: 499 },
  { id: '3', deliveryDays: 1, rupees: 999 }
];

// Helper to get delivery option by id
function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find(option => option.id === deliveryOptionId) || deliveryOptions[0];
}

// Check if dayjs date is weekend
function isWeekend(date) {
  const dayOfWeek = date.format('dddd');
  return dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
}

// Calculate estimated delivery date excluding weekends
function calculateDeliveryDate(deliveryOption) {
  let remainingDays = deliveryOption.deliveryDays;
  let deliveryDate = dayjs();

  while (remainingDays > 0) {
    deliveryDate = deliveryDate.add(1, 'day');
    if (!isWeekend(deliveryDate)) {
      remainingDays--;
    }
  }
  return deliveryDate.toISOString(); // Return ISO string for API response
}

let orders = [];

app.post("/orders", (req, res) => {
  const { cart, totalPrice } = req.body;
  if (!cart || !totalPrice) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const orderId = uuidv4();
  const orderTime = new Date().toISOString();

  const productsWithEstimate = cart.map(product => {
    const deliveryOption = getDeliveryOption(product.deliveryOptionId);
    return {
      productId: product.productId,
      quantity: product.quantity,
      estimatedDeliveryTime: calculateDeliveryDate(deliveryOption),
      variation: null
    };
  });

  const newOrder = {
    id: orderId,
    orderTime,
    totalPrice,
    products: productsWithEstimate
  };

  orders.push(newOrder);

  res.status(201).json({
    message: "✅ Order saved successfully",
    ...newOrder
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
