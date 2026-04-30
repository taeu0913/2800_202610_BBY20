const express = require("express");
const path = require("path");
require("dotenv").config();

const { connectDB } = require("./config/db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let db;

// Start server ONLY after DB is ready
async function startServer() {
  try {
    db = await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

// SAFE API ROUTE
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.collection("BBY20").find().toArray();

    res.json({
      success: true,
      data: users
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
});