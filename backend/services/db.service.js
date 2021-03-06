const MongoClient = require('mongodb').MongoClient;

const config = require('../config')

module.exports = {
    getCollection
}

// Database Name
const dbName = 'workflow_db';

var dbConn = null;

async function getCollection(collectionName) {
    const db = await connect()
    return db.collection(collectionName);
}

async function connect() {
    if (dbConn) return dbConn;
    try {
        const url = 'mongodb+srv://admin:admin@cluster0-2tnkw.mongodb.net/test?retryWrites=true&w=majority';
        const client = await MongoClient.connect(url, { useUnifiedTopology: true });
        const db = client.db(dbName);
        dbConn = db;
        return db;
    } catch (err) {
        console.log('Cannot Connect to DB', err)
        throw err;
    }
}