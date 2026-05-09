const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://john:12345@bby20.p8y50me.mongodb.net/authentications";
const client = new MongoClient(uri, {});

module.exports = client;
