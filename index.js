// Module Dependencies
const { MongoClient } = require("mongodb");

// Local Variables
const dbUrl = "<coredb_mongo_uri>";
const dbName = "rawcms_production";
const apiKeys = [""];
const searchCollectionNames = ["entries", "publish_objects"];
const searchString = "stake.com";

async function main() {
  const dbClient = new MongoClient(dbUrl);
  await dbClient.connect();
  const db = dbClient.db(dbName);

  for (let searchCollectionName of searchCollectionNames) {
    for (let apiKey of apiKeys) {
      let resultSetCount = await db
        .collection(`${apiKey}.${searchCollectionName}`)
        .count({});
      console.error(
        `Current Batch: ${apiKey}.${searchCollectionName}: ${resultSetCount}`
      );
      for (let iteration = 0; ; iteration = iteration + 100) {
        let resultSet = await db
          .collection(`${apiKey}.${searchCollectionName}`)
          .find({}, { limit: 100, skip: iteration })
          .toArray();

        if (resultSet.length == 0) break;

        for (let doc of resultSet) {
          let docString = JSON.stringify(doc);

          if (docString.includes(searchString)) {
            console.log(
              `${apiKey}, ${apiKey}.${searchCollectionName}, ${doc._id}, ${doc.uid}`
            );
          }
        }
      }
    }
  }

  await dbClient.close();
}

main()
  .then(() => {
    console.error("Log: Success");
  })
  .catch((e) => {
    console.error("Log: Error: ", e);
  });
