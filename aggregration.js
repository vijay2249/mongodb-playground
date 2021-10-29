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
    
    await listDatabasesIn(client); //get the list of the databases 

    await aggregationOperations(client, {
      name: 'viz',
      branch: 'EEE',
      minGPA: 6.5,
      isExists: 1,
      limit: 20
    })

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

// aggregation pipelines
async function aggregationOperations(client, filters){
  const pipeline = [
    {
      "$match":{
        // all the matching attributes
        name: filters.name,
        course: filters.branch,
        gpa: {$gt: filters.minGPA}, //gpa greater than 6.5
        clubs:{
          "$exists": filters.isExists, //is clubs exists
          "$ne": '' //is clubs value not equal to empty string
        }
      }
    },
    {
      // grouping the list with these attributes
      // these will the output
      "group":{
        _id: "$student.rollNo",
        'avgCGPA': {
          '$avg': "$student.cgpa"
        }
      }
    },
    {
      '$sort': {
        'avgCGPA': 1
      }
    },
    {
      '$limit': filters.limit
    }
  ]

  // we execute the pipeline in nodejs by calling aggregate on the collection
  // this returns aggregation cursor
  const agreCursor = await client.db("aggregate_db").collection("mongo2").aggregate(pipeline)

  agreCursor.forEach(list =>{
    console.log(`${list._id}: ${list.avgCGPA}`);
  })

}

// list all the databases in the user
async function listDatabasesIn(client){
  const databasesList = await client.db().admin().listDatabases();
  // this return array of objects with database name and size and isempty parameter to each database
  databasesList.databases.forEach(db =>{
    console.log(db.name);
  })
}