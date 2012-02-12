/*
 * Module Dependencies
 */

var azure = require("azure")
  , uuid = require("node-uuid");

var ServiceClient = azure.ServiceClient;

/* Constants for working with Azure Table Storage */
var logTableName = 'nodepdxlogger';
var partitionKey = 'MagicalPartition';
var tableQuery = azure.TableQuery;

var Log = module.exports = exports = function Log(){
    //Instantiate the table service client
    this.tableClient = azure.createTableService();
    //For when we need to run outside of the azure emulator locally...
    /*    this.tableClient = azure.createTableService(ServiceClient.DEVSTORE_STORAGE_ACCOUNT,
      ServiceClient.DEVSTORE_STORAGE_ACCESS_KEY, ServiceClient.DEVSTORE_TABLE_HOST);*/
}

/* Initialization method to create our table if it doesn't exist */
Log.prototype.init = function(fn){
    this.tableClient.createTableIfNotExists(logTableName, function(error, created){
       if(error){ //If there was an error attempting to create this table, log it
           console.log(error.message);

           //Bail out early if there's an error
           return fn(error);
       }
       console.log('Successfully created table %s', logTableName);
       fn();
    });
}

Log.prototype.save = function(logRecord, fn){
    //Add some mandatory stuff for record-keeping purposes
    logRecord.PartitionKey = partitionKey;
    logRecord.RowKey = uuid();
    this.tableClient.insertEntity(logTableName, logRecord, fn);
}

Log.prototype.list = function(count, fn){
    if(!count) count = 30;

    //Search for log records for (PartitionKey: username, RowKey:null)
    var query = tableQuery.select().from(logTableName).where("PartitionKey eq ?", partitionKey).top(count);

    this.tableClient.queryEntities(query, function(error, rows){
        if(error){ //Return the error back to the caller via callback
            console.log('error: %s', error.message);
            return fn(error, null);
        }
        fn(null, rows);
    });
}

Log.prototype.destroy = function(logId, fn){
    var logEntity = {PartitionKey:partitionKey, RowKey:logId};
    this.tableClient.deleteEntity(logTableName,logEntity, fn);
}