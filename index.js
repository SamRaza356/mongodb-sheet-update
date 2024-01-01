const fs = require('fs');
const xlsx = require('xlsx');
const { MongoClient, ObjectId } = require('mongodb');

const mongoURL = "mongodb://0.0.0.0:27017";
const dbName = 'database name';

const excelFilePath = 'path/to_file.xlsx';

function readExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
}

async function updateMongoDB(data) {
  const client = new MongoClient(mongoURL, { useUnifiedTopology: true });

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('collection_name');

    for (const item of data) {
      const filter = { import_venue_id: parseInt(item.import_venue_id) };
      const update = { $set: { latitude: item.latitude, longitude: item.longitude, address: item.address, city: item.city, state: item.state, zip: item.zip } };
      try {
        const result = await collection.updateOne(filter, update);
      } catch (error) {
        console.log("Error:",error);
      }
      console.log(`Updated latitude and longitude for record with id ${item.import_venue_id}`);

    }
  } finally {
    client.close();
  }
}

async function main() {
  try {
    const data = readExcel(excelFilePath);
    await updateMongoDB(data);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
