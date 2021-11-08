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


// ACID TRANSACTIONS
// ATOMICITY
// CONSISTENCY
// ISOLATION
// DURABILITY


// list all the databases in the user
async function listDatabasesIn(client){
  const databasesList = await client.db().admin().listDatabases();
  // this return array of objects with database name and size and isempty parameter to each database
  databasesList.databases.forEach(db =>{
    console.log(db.name);
  })
}