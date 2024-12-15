const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/botbish";
const client = new MongoClient(uri)

async function getClient() {
    client.connect();
    return client.db("botbish");
}

async function getCollection(collectionName) {
    const client = await getClient();
    const collection = client.collection(collectionName);
    return collection;
}

async function findOne(filter, collectionName) {
    const collection = await getCollection(collectionName)
    return await collection.findOne(filter);
}

async function findAll(collectionName) {
    const collection = await getCollection(collectionName)
    return await collection.find().toArray();
}

async function getNextId(collectionName) {
    const collection = await getCollection(collectionName)
    const itemWithHighestId = await collection.findOne({}, { sort: { id: -1 } });
    return ((itemWithHighestId || {}).id || 0) + 1;
}

async function updateOne(filter, set, collectionName) {
    const collection = await getCollection(collectionName)
    return await collection.updateOne(filter, { $set: set }, { upsert: true });
}

async function incrementOne(filter, inc, collectionName) {
    const collection = await getCollection(collectionName)
    await collection.updateOne(filter, { $inc: inc });
}

async function insert(insert, collectionName) {
    const collection = await getCollection(collectionName)
    await collection.insertOne(insert);
}

async function remove(filter, collectionName) {
    const collection = await getCollection(collectionName)
    await collection.deleteMany(filter);
}

async function findAllSorted(sort, collectionName) {
    const collection = await getCollection(collectionName)
    return await collection.find({}, { sort: sort }).toArray();
}

async function clearCollection(collectionName) {
    const collection = await getCollection(collectionName)
    await collection.deleteMany();
}

module.exports = {
    getCollection: getCollection,
    findOne: findOne,
    findAll: findAll,
    updateOne: updateOne,
    getNextId: getNextId,
    incrementOne: incrementOne,
    remove: remove,
    insert: insert,
    findAllSorted: findAllSorted,
    clearCollection: clearCollection
};