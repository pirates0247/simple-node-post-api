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

        // 🔍 Debug log to confirm what frontend is sending
        console.log("📥 Received order data from frontend:", data);

        const orderTime = new Date();
        const deliveryTime = new Date(orderTime);
        deliveryTime.setDate(orderTime.getDate() + 7);

        const productsList = (data.products || []).map(item => ({
          ...item,
          estimatedDeliveryTime: deliveryTime.toISOString(),
          variation: null
        }));

        // Build response with totalPrice
        const response = {
          id: randomUUID(),
          orderTime: orderTime.toISOString(),
          products: productsList,
          cartQuantity: data.cartQuantity || 0,
          totalPrice: data.totalPrice || 0
        };

        // 🔍 Debug log to confirm what server will send back
        console.log("📤 Sending response back to frontend:", response);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (err) {
        console.error("❌ Error parsing JSON:", err);
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
