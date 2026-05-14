const express = require("express");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
require("dotenv").config();

// const { connectDB } = require("./config/db");

const app = express();
const PORT = 3000;

app.use(session({
  secret: "9899e993-96a0-4fc9-811a-c884e08efdfd",
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'templates/skeleton');

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (!req.session.hasVisited) {
    res.locals.firstTimeUser = true;
    req.session.hasVisited = true;
  } else {
    res.locals.firstTimeUser = false;
  }
  next();
});

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
  res.render('pages/index', { layout: 'templates/auth-layout'} );
});

app.get("/main", (req, res) => {
  res.render('pages/main', { layout: 'templates/skeleton'} );
});

app.get("/profile", (req, res) => {
  const user = req.session.user || { name: "Guest", email: "guest@example.com" };
  res.render('pages/profile', { layout: 'templates/skeleton', user });
});

app.delete("/delete-account", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.use((req, res) => {
  res.status(404);
  res.render('pages/404');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log("server.js loaded");