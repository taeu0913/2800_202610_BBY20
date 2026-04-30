const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    console.log("Connected to MongoDB");

    return client.db();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}

module.exports = { connectDB };