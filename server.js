const http = require("http");
const { randomUUID } = require("crypto");

// Example product prices (in paise)
const products = {
  "54e0eccd-8f36-462b-b68a-8182611d9add": 2000, // ₹20.00
  "83d4ca15-0f35-48f5-b7a3-1ea210004f2e": 1500, // ₹15.00
  "e43638ce-6aa0-4": 2501, // ₹25.01
  "15b6fc6f-327a-4": 1750  // ₹17.50
};

const server = http.createServer((req, res) => {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/orders") {
    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body);

          if (!data.cart || !Array.isArray(data.cart)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Send { cart: [...] }" }));
          }

          // ✅ Order time
          const orderTime = new Date();
          const deliveryTime = new Date(orderTime);
          deliveryTime.setDate(orderTime.getDate() + 7);

          // ✅ Calculate totalPrice & build products
          let totalPrice = 0;
          const productsList = data.cart.map(item => {
            const price = products[item.productId] || 0;
            totalPrice += price * (item.quantity || 1);

            return {
              productId: item.productId,
              quantity: item.quantity || 1,
              estimatedDeliveryTime: deliveryTime.toISOString(),
              variation: null
            };
          });

          // ✅ Build final response
          const response = {
            id: randomUUID(),
            orderTime: orderTime.toISOString(),
            totalPrice,
            products: productsList
          };

          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));

        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
