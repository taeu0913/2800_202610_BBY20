const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://john:12345@ac-jbr310b-shard-00-00.p8y50me.mongodb.net:27017,ac-jbr310b-shard-00-01.p8y50me.mongodb.net:27017,ac-jbr310b-shard-00-02.p8y50me.mongodb.net:27017/authentications?ssl=true&replicaSet=atlas-ptu4al-shard-0&authSource=admin&appName=BBY20";
const client = new MongoClient(uri, {});

module.exports = client;
