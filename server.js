const express = require("express");
const path = require("path");
require("dotenv").config();

// const { connectDB } = require("./config/db");

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let db;

// Start server ONLY after DB is ready
// async function startServer() {
//   try {
//     db = await connectDB();

//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("Failed to start server:", err);
//     process.exit(1);
//   }
// }

// startServer();

app.get("/", (req, res) => {
  res.render('pages/index');
});

app.use((req, res) => {
  res.status(404);
  res.render('pages/404');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log("server.js loaded");