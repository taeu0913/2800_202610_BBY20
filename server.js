require("dotenv").config();
const express = require("express");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const { MongoClient } = require("mongodb");
const Mongo = require("connect-mongo").default;
const path = require("path");
const client = require("./dbConnect.js");

// const { connectDB } = require("./config/db");

const app = express();
const PORT = 3000;

var mongoStore = Mongo.create({
  mongoUrl: `mongodb+srv://john:12345@bby20.p8y50me.mongodb.net/authentications`,
  // crypto: {
  // 	secret: mongodb_session_secret,
  // }
});

// TODO: Put secrets in .env next sprint
// TODO: implement crypto for store next sprint
app.use(session({
  secret: "9899e993-96a0-4fc9-811a-c884e08efdfd",
  resave: false,
  saveUninitialized: true,
  store: mongoStore
}));

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'templates/skeleton');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
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

const usersCol = client.db("authentications").collection('users');

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

// Web Application Routes
app.get("/", (req, res) => {
  res.render('pages/index', { layout: 'templates/auth-layout' });
});

app.get("/main", (req, res) => {
  res.render('pages/main', { layout: 'templates/skeleton' });
});

app.get("/logIn", (req, res) => {
  res.render('pages/logIn', { layout: 'templates/auth-layout' });
});

app.get("/signUp", (req, res) => {
  res.render('pages/signUp', { layout: 'templates/auth-layout' });
});

app.post("/signingUp", async (req, res) => {

  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  // Processes the creation of a new user
  // TODO: Hash passwords once encryption is implemented next sprint.	
  await usersCol.insertOne({ username: username, email: email, password: password });
  req.session.authenticated = true;
  req.session.username = username;

  console.log("User created!");
  res.redirect('/main');
})

// TODO: Move to EJS if possible
app.post("/loggingIn", async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

	const result = await usersCol.find({email: email}).project({username: 1, email: 1, password: 1, _id: 1}).toArray();

	console.log(result);
	if (result.length != 1) {
        res.send(`
        <p>Email is wrong!<p>   
        <a href="/login">Go back</a>    
        `)
		return;
	}
	if (password === result[0].password) {
		req.session.authenticated = true;
		req.session.username = result[0].username;
    console.log("correct password");

		res.redirect('/main');
		return;
	}
	else {
        res.send(`
        <p>Password is wrong!<p>   
        <a href="/login">Go back</a>    
        `)
		return;
	}
});

app.use((req, res) => {
  res.status(404);
  res.render('pages/404');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log("server.js loaded");