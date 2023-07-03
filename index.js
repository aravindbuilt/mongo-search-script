// Module Dependencies
const { MongoClient } = require("mongodb");

// Local Variables
const clusterDbUrl = "";
const clusterDbName = "";
const clusterDbCollectionName = "";
const clusterDbApiKeys = [""];
const searchCollectionNames = ["", ""];
const searchString = "";

async function main() {
  const clusterDbClient = new MongoClient(clusterDbUrl);
  await clusterDbClient.connect();
  const clusterDb = clusterDbClient.db(clusterDbName);
  const clusterDbCollection = clusterDb.collection(clusterDbCollectionName);

  const clusterConnectionDocs = await clusterDbCollection
    .find({ api_key: { $in: clusterDbApiKeys } })
    .toArray();

  for (const clusterConnectionDoc of clusterConnectionDocs) {
    let stackConnectionUrl = clusterConnectionDoc.url;
    let stackApiKey = clusterConnectionDoc.api_key;
    let stackDbName = clusterConnectionDoc.dbName;

    const stackDbClient = new MongoClient(stackConnectionUrl);
    await stackDbClient.connect();
    const stackDb = stackDbClient.db(stackDbName);
    for (const searchCollectionName of searchCollectionNames) {
      const searchCollection = stackDb.collection(
        `${stackApiKey}.${searchCollectionName}`
      );

      for (let iteration = 0; ; iteration = iteration + 100) {
        const searchDocs = await searchCollection
          .find({}, { limit: 100, skip: iteration })
          .toArray();
        if (searchDocs.length == 0) break;

        for (const searchDoc of searchDocs) {
          const searchDocString = JSON.stringify(searchDoc);
          if (searchDocString.includes(searchString)) {
            console.log(
              `${searchDoc.api_key},${searchDoc.uid},${searchDoc._id},${searchDoc.locale}`
            );
          }
        }
      }
    }

    await stackDbClient.close();
  }

  await clusterDbClient.close();
}

main()
  .then(() => {
    console.log("Log: Success");
  })
  .then((e) => {
    console.error("Log: Error: ", e);
  });
