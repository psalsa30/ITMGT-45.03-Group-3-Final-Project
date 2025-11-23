// server/index.js
import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 8000;

// --- middleware ---
app.use(cors());
app.use(express.json());

// --- sample product data ---
const products = [
  { id: "s-201", name: "A4 Bond Paper (500s)", price: 180, category: "School Supplies", campus: "ADMU", image: "bondpaper.jpg" },
  { id: "s-202", name: "Yellow Pad (80 leaves)", price: 45, category: "School Supplies", campus: "ADMU", image: "yellowpad.jpg" },
  { id: "s-203", name: "UniThrift Tote Bag", price: 150, category: "Preloved", campus: "UPD", image: "totebag.jpg" },
  { id: "s-204", name: "Refillable Notebook", price: 120, category: "School Supplies", campus: "UST", image: "notebook.jpg" },
  { id: "b-101", name: "GE Book: Ethics", price: 120, category: "Books", campus: "ADMU", image: "ethics.jpg" },
  { id: "g-301", name: "Wired Earphones", price: 150, category: "Gadgets", campus: "UPD", image: "earphones.jpg" },
];

// Helper: Read orders from file
function readOrders() {
  try {
    if (fs.existsSync("orders.json")) {
      return JSON.parse(fs.readFileSync("orders.json", "utf8"));
    }
  } catch (err) {
    console.error("Error reading orders:", err);
  }
  return [];
}

// Helper: Write orders to file
function writeOrders(orders) {
  try {
    fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing orders:", err);
    return false;
  }
}

// --- API: Get all products ---
app.get("/api/products", (_req, res) => {
  res.json(products);
});

// --- API: Get all orders (for admin dashboard) ---
app.get("/api/orders", (_req, res) => {
  const orders = readOrders();
  res.json(orders);
});

// --- API: Get orders with filters ---
app.get("/api/orders/filter", (req, res) => {
  const { campus, category, status, dateFrom, dateTo } = req.query;
  let orders = readOrders();

  // Apply filters
  if (campus && campus !== 'all') {
    orders = orders.filter(o => o.campus === campus);
  }
  if (category && category !== 'all') {
    orders = orders.filter(o => o.category === category);
  }
  if (status && status !== 'all') {
    orders = orders.filter(o => o.status === status);
  }
  if (dateFrom) {
    const fromDate = new Date(dateFrom).getTime();
    orders = orders.filter(o => new Date(o.date).getTime() >= fromDate);
  }
  if (dateTo) {
    const toDate = new Date(dateTo).getTime();
    orders = orders.filter(o => new Date(o.date).getTime() <= toDate);
  }

  res.json(orders);
});

// --- API: Get dashboard statistics ---
app.get("/api/dashboard/stats", (_req, res) => {
  const orders = readOrders();
  
  const now = Date.now();
  const last30Days = now - 30 * 24 * 60 * 60 * 1000;
  const last60Days = now - 60 * 24 * 60 * 60 * 1000;

  // Current period (last 30 days)
  const currentOrders = orders.filter(o => new Date(o.date).getTime() >= last30Days);
  const currentRevenue = currentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const currentOrderCount = currentOrders.length;

  // Previous period (30-60 days ago)
  const previousOrders = orders.filter(o => {
    const orderTime = new Date(o.date).getTime();
    return orderTime >= last60Days && orderTime < last30Days;
  });
  const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const previousOrderCount = previousOrders.length;

  // Calculate changes
  const revenueChange = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
    : 0;
  const ordersChange = previousOrderCount > 0
    ? ((currentOrderCount - previousOrderCount) / previousOrderCount * 100).toFixed(1)
    : 0;

  // Average order value
  const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
  const prevAvgOrderValue = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
  const avgChange = prevAvgOrderValue > 0
    ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue * 100).toFixed(1)
    : 0;

  // Active users
  const activeUsers = new Set(currentOrders.map(o => o.customer || o.phone)).size;
  const previousUsers = new Set(previousOrders.map(o => o.customer || o.phone)).size;
  const usersChange = previousUsers > 0
    ? ((activeUsers - previousUsers) / previousUsers * 100).toFixed(1)
    : 0;

  res.json({
    totalRevenue: currentRevenue,
    revenueChange: parseFloat(revenueChange),
    totalOrders: currentOrderCount,
    ordersChange: parseFloat(ordersChange),
    avgOrderValue: avgOrderValue,
    avgChange: parseFloat(avgChange),
    activeUsers: activeUsers,
    usersChange: parseFloat(usersChange)
  });
});

// --- API: Get revenue by date ---
app.get("/api/dashboard/revenue-by-date", (req, res) => {
  const { days = 30 } = req.query;
  const orders = readOrders();
  const cutoff = Date.now() - parseInt(days) * 24 * 60 * 60 * 1000;
  
  const revenueByDate = {};
  orders
    .filter(o => new Date(o.date).getTime() >= cutoff)
    .forEach(order => {
      const date = new Date(order.date).toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + (order.total || 0);
    });

  const dates = Object.keys(revenueByDate).sort();
  const revenues = dates.map(d => revenueByDate[d]);

  res.json({ dates, revenues });
});

// --- API: Get orders by category ---
app.get("/api/dashboard/orders-by-category", (_req, res) => {
  const orders = readOrders();
  const categoryData = {};

  orders.forEach(order => {
    const cat = order.category || 'Other';
    categoryData[cat] = (categoryData[cat] || 0) + 1;
  });

  res.json(categoryData);
});

// --- API: Get revenue by campus ---
app.get("/api/dashboard/revenue-by-campus", (_req, res) => {
  const orders = readOrders();
  const campusData = {};

  orders.forEach(order => {
    const campus = order.campus || 'Unknown';
    campusData[campus] = (campusData[campus] || 0) + (order.total || 0);
  });

  res.json(campusData);
});

// --- API: Get orders by payment method ---
app.get("/api/dashboard/payment-methods", (_req, res) => {
  const orders = readOrders();
  const paymentData = {};

  orders.forEach(order => {
    const method = order.paymentMethod || 'cash';
    paymentData[method] = (paymentData[method] || 0) + 1;
  });

  res.json(paymentData);
});

// --- API: Get single order by ID ---
app.get("/api/orders/:orderId", (req, res) => {
  const orders = readOrders();
  const order = orders.find(o => o.orderId === req.params.orderId);
  
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// --- API: Update order status ---
app.patch("/api/orders/:orderId/status", (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const orders = readOrders();
  const orderIndex = orders.findIndex(o => o.orderId === req.params.orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  if (writeOrders(orders)) {
    res.json(orders[orderIndex]);
  } else {
    res.status(500).json({ error: "Failed to update order" });
  }
});

// --- friendly GET for checkout ---
app.get("/api/cart/checkout", (_req, res) => {
  res
    .status(405)
    .send("Use POST /api/cart/checkout to place an order (with JSON body).");
});

// --- POST: Checkout + Save order ---
app.post("/api/cart/checkout", (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

  const orderId = "ORD-" + Date.now();
  const pickup = { etaMins: 15, fee: 0 };
  
  // Extract additional data from request
  const { paymentMethod = 'cash', address = '', phone = '', campus = 'ADMU' } = req.body;
  
  // Determine category from items
  const category = items.length > 0 ? (items[0].category || 'Other') : 'Other';
  
  const orderData = {
    orderId,
    date: new Date().toISOString(),
    customer: phone || 'guest@unithrift.com',
    phone: phone,
    address: address,
    items: items.length,
    itemDetails: items,
    category: category,
    campus: campus,
    subtotal: total,
    deliveryFee: pickup.fee,
    total: total + pickup.fee,
    paymentMethod: paymentMethod,
    status: 'confirmed',
    pickup: pickup,
    createdAt: new Date().toISOString()
  };

  // Read existing orders
  const orders = readOrders();
  
  // Add new order
  orders.push(orderData);
  
  // Save to file
  if (writeOrders(orders)) {
    console.log(`✅ Saved order ${orderId}`);
    res.json(orderData);
  } else {
    res.status(500).json({ error: "Failed to save order" });
  }
});

// --- API: Delete order (admin only) ---
app.delete("/api/orders/:orderId", (req, res) => {
  const orders = readOrders();
  const filteredOrders = orders.filter(o => o.orderId !== req.params.orderId);
  
  if (filteredOrders.length === orders.length) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (writeOrders(filteredOrders)) {
    res.json({ message: "Order deleted successfully" });
  } else {
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- 404 handler ---
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 UniThrift backend running at http://localhost:${PORT}`);
  console.log(`📊 Admin API available at http://localhost:${PORT}/api/orders`);
  console.log(`📈 Dashboard stats at http://localhost:${PORT}/api/dashboard/stats`);
});