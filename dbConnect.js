// const MongoClient = require("mongodb").MongoClient;
// const uri = "mongodb://john:12345@bby20.p8y50me.mongodb.net/authentications";
// const client = new MongoClient(uri, {});

// module.exports = client;


const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

// connect immediately (safe pattern for school projects)
client.connect()
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

module.exports = client;

