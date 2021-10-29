import { MongoClient } from "mongodb";

// the uri must be the connection url that connects to the mongodb database
const uri = "mongodb://127.0.0.1:27017/?retryWrites=true&writeConcern=majority";

// create a client instance
const client = new MongoClient(uri);

// write the main function 
// the function is async function as there the data is fetched through promise
async function main() {
  // ensure to run the logic in try catch block to possibly log any errors in the execution
  try{
    await client.connect();
    console.log("Connection success");
    
    // await listDatabasesIn(client); //get the list of the databases 

    // create operation - insertOne operation
    // await createNewListing(client, {
    //   _id: 1,
    //   name: 'viz',
    //   work: 'learning mongodb',
    //   from: 'youtube official channel'
    // })

    // create operation - insertMany operation
    // await insertManyOperation(client, [
    //   {
    //     _id: 2,
    //     name: "pen",
    //     price: 1.5,
    //     stock: 300,
    //     rating: 3
    //   },
    //   {
    //     _id: 3,
    //     name: "paper",
    //     price: 1,
    //     stock: 200,
    //     rating: 5
    //   },
    //   {
    //     _id: 4,
    //     name: "rubber",
    //     price: 10,
    //     stock: 10,
    //     rating: 1,
    //     review: [
    //       {
    //         authorName: 'a',
    //         review: 'good work'
    //       },
    //       {
    //         authorName: "b",
    //         review: 'bad one though'
    //       }
    //     ]
    //   },
    //   {
    //     _id: 5,
    //     name: "scissor",
    //     price: 15.2,
    //     stock: 30,
    //     rating: 10,
    //     author: 'Hello there'
    //   }
    // ])

    // read - findOne operation
    // await findOneOperation(client, {name: 'pen'}) //result yes
    // await findOneOperation(client, {name: 'vijay'}) //result none

    // // read - find operation
    // await findOperation(client, {
    //   minimumPrice: 2,
    //   maximumStock: 300,
    //   limit: 2
    // })

    // update - updateOne operation
    // await updateOneOperation(client,
    //   {
    //     minimumPrice: 2
    //   },
    //   {
    //     stock: 0,
    //     isAvailable: false
    //   }
    // )

    // upsert operation
    await upsertOperation(client,
      {name: 'unknown'},
      {
        stock: 0,
        isAvailable: false
      }
    )

  }catch(e){
    console.log(e);
  }
  // this block of logic runs after the try catch block logic is run whether that is try block or catch block of code
  finally{
    await client.close(); // Ensures that the client will close when you finish/error
  }
}
// any errors on running the main function the console log the errors
main().catch(console.dir);

// upsert operation
async function upsertOperation(client, filter, newData){
  const result = await client.db("new_db").collection("youtube").updateOne(
    {name: filter.name}, {$set: newData}, {upsert: true}
  )
  console.log(`${result.matchedCount} documents follows the criteria`);
  if(result.upsertedCount > 0){
    console.log(`one document was inserted with id: ${result.upsertedId}`);
  }else{
    console.log(`${result.modifiedCount} documents are updated`);
  }
}

// update - updateOne operation
async function updateOneOperation(client, filter, newData){
  const results = await client.db("new_db").collection("youtube").updateOne(
    {
      price: {$gte: filter.minimunPrice}
      // name: filter.name
    },
    {
      $set: newData
    }
  )
  console.log(`${results.matchedCount} documents follows the criteria`);
  console.log(`${results.modifiedCount} documents were changed`);
}

// read - find operation
async function findOperation(client, query){
  if(query.maximumStock === undefined)query.maximumStock = 0;
  if(query.limit === undefined)query.limit = Number.MAX_SAFE_INTEGER;
  const cursor = await client.db("new_db").collection("youtube").find({
    price: {$gte: query.minimumPrice},
    stock: {$lte: query.maximumStock}
  }).sort({price: -1})
    .limit(query.limit)
  
  const results = await cursor.toArray();
  if(results.length > 0){
    console.log(`Found the records that match the given conditions`);
    console.log(results);
  }else{
    console.log("Found none records that match the given contitions in the database");
  }
}

// read - findOne operation
async function findOneOperation(client, query){
  const results = await client.db("new_db").collection("youtube").findOne({name: query.name})
  if(results){
    console.log(`Found data with the name ${query.name}`);
    console.log(results);
  }else{
    console.log(`There is no record with the name ${query.name}`);
  }
}

// create operation - insertOne operation
async function createNewListing(client, newList){
  const result = await client.db("new_db").collection("youtube").insertOne(newList)
  console.log(`new data inserted with id: ${result.insertedId}`);

}

// create - insertMany operation
async function insertManyOperation(client, manyList){
  const result = await client.db("new_db").collection("youtube").insertMany(manyList);
  console.log(`${result.insertedCount} number of items are added to the database`);
  console.log(result.insertedIds);
}

// list all the databases in the user
async function listDatabasesIn(client){
  const databasesList = await client.db().admin().listDatabases();
  // this return array of objects with database name and size and isempty parameter to each database
  databasesList.databases.forEach(db =>{
    console.log(db.name);
  })
}