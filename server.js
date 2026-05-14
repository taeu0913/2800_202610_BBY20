require("dotenv").config();
const express = require("express");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const { MongoClient } = require("mongodb");
const MongoStore = require("connect-mongo").default;
const path = require("path");
// const client = require("./dbConnect.js");
const dns = require('node:dns');
const bcrypt = require('bcrypt');
const saltRounds = 12;

// const { connectDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;
const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour

dns.setServers(['8.8.8.8', '8.8.4.4']);

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_user_database = process.env.MONGODB_USER_DATABASE;
const mongodb_session_database = process.env.MONGODB_SESSION_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

const client = require('./dbConnect');

// users collection
const usersCol = client.db(mongodb_user_database).collection('users');

// shadespots collection
const shadeSpotsCol = client.db(mongodb_user_database).collection('shadeSpots');

// suggestions collection
const suggestionsCol = client.db(mongodb_user_database).collection('suggestions');

// var mongoStore = Mongo.create({
//   mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_session_database}`,
//   // crypto: {
//   // 	secret: mongodb_session_secret,
//   // }
// });

const mongoStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: mongodb_session_database,
    crypto: {
        secret: mongodb_session_secret
    }
});

// TODO: Put secrets in .env next sprint
// TODO: implement crypto for store next sprint
app.use(session({ 
    secret: node_session_secret,
	store: mongoStore, //default is memory store 
	saveUninitialized: false, 
	resave: false,
    cookie: {
        maxAge: expireTime
    }
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

// Functions

function valSesh(req,res,next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/logIn');
    }
}

// Web Application Routes
app.get("/", (req, res) => {
  res.render('pages/index', {
  layout: 'templates/auth-layout', 
  req: req,
  res: res});
});

app.get("/main", valSesh, (req, res) => {

  res.render('pages/main', { 
  layout: 'templates/skeleton',
  req: req,
  res: res });
});

app.get("/logIn", (req, res) => {
  res.render('pages/logIn', { 
  layout: 'templates/auth-layout',
  req: req,
  res: res });
});

app.get("/signUp", (req, res) => {
  res.render('pages/signUp', { 
  layout: 'templates/auth-layout',
  req: req,
  res: res });
});

app.post("/signingUp", async (req, res) => {

  var { username, email, password } = req.body;

  var hashedPassword = await bcrypt.hash(password, saltRounds);
  
  await usersCol.insertOne({ username: username, email: email, password: hashedPassword, user_type: 'user' });
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

	// console.log(result); 
	if (result.length != 1) {
        res.send(`
        <p>Email is wrong!<p>   
        <a href="/login">Go back</a>    
        `)
		return;
	}
	if (await bcrypt.compare(password, result[0].password)) {
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

app.post("/loggingOut", async (req, res) => {
  req.session.authenticated = false;
	req.session.destroy();
  res.redirect('/');
});

app.get("/api/shadespots", async (req, res) => {

    const spots = await shadeSpotsCol.find({}).toArray();

    res.json(spots);
});

app.post("/api/shadespots", async (req, res) => {

    const { name, type, lat, lng, description, bestShadedAt } = req.body;

    await shadeSpotsCol.insertOne({
        name,
        type,
        lat,
        lng,
        description,
        bestShadedAt,
        createdBy: req.session.username || "anonymous",
        createdAt: new Date()
    });

    res.json({
        success: true
    });
});

app.get("/api/suggestions", async (req, res) => {

    const suggestions = await suggestionsCol.find({}).toArray();

    res.json(suggestions);
});

app.post("/api/suggestions", async (req, res) => {

    const { category, description, lat, lng } = req.body;

    await suggestionsCol.insertOne({
        category,
        description,
        lat,
        lng,
        createdBy: req.session.username || "anonymous",
        createdAt: new Date()
    });

    res.json({
        success: true
    });
});

app.use((req, res) => {
  res.status(404);
  res.render('pages/404', { 
  layout: 'templates/auth-layout',
  req: req,
  res: res });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log("server.js loaded");