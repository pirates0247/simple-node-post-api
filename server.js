const http = require("http");
const { randomUUID } = require("crypto");

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/orders" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        // 🛠 Debug log
        console.log("📦 Received order data:", data);

        const orderTime = new Date();
        const deliveryTime = new Date(orderTime);
        deliveryTime.setDate(orderTime.getDate() + 7);

        // Ensure products is always an array
        const productsList = Array.isArray(data.products)
          ? data.products.map(item => ({
              ...item,
              estimatedDeliveryTime: deliveryTime.toISOString(),
              variation: null
            }))
          : [];

        // Ensure totalPrice is a number
        const totalPrice = Number(data.totalPrice) || 0;

        // Build response
        const response = {
          id: randomUUID(),
          orderTime: orderTime.toISOString(),
          products: productsList,
          cartQuantity: data.cartQuantity || 0,
          totalPrice: totalPrice
        };

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (err) {
        console.error("❌ Error parsing request:", err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

server.listen(3000, () => console.log("🚀 Server running on port 3000"));
