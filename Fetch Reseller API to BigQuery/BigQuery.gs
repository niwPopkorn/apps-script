function deleteTableData(daysKeep){
  
  var projectId = BIGQUERY_PROJECTID;
  var datasetId = BIGQUERY_DATASETID;
  
  var pageToken, page;
  
  do{
    page = BigQuery.Tables.list(projectId, datasetId, {pageToken:pageToken});
    
    var tables = page.tables;
    
    if(tables){
      for(var i=tables.length-(daysKeep+1); i>=0; i--){
        var table = tables[i];
        var tableId = table.tableReference.tableId;
        BigQuery.Tables.remove(projectId, datasetId, tableId);
      }
    }
    
    pageToken = page.nextPageToken;
  }while(pageToken);
}

function getLatestTableDataId(){
  var projectId = BIGQUERY_PROJECTID;
  var datasetId = BIGQUERY_DATASETID;
  
  var pageToken, page;
  
  do{
    page = BigQuery.Tables.list(projectId, datasetId, {pageToken:pageToken});
    
    var tables = page.tables;
    
    if(tables){
      for(var i=tables.length-1; i<tables.length; i--){
        var table = tables[i];
        return table.tableReference.tableId;        
      }
    }
    
    pageToken = page.nextPageToken;
  }while(pageToken);
  
}

function loadDataToBigQuery(projectId,datasetId) {

  // Create the table.
  var tableId = 'subscriptions_' + Utilities.formatDate(new Date(), 'GMT+0700', 'YYYYMMddHHmmss');
  var table = {
    tableReference: {
      projectId: projectId,
      datasetId: datasetId,
      tableId: tableId
    },
    schema: {
      fields: [
        {name: "kind", type: 'STRING'},
        {name: "customerId", type: 'STRING'},
        {name: "subscriptionId", type: 'STRING'},
        {name: "skuId", type: 'STRING'},
        {name: "creationTime", type: 'TIMESTAMP'},
        {name: "billingMethod", type: 'STRING'},
        {name: "plan", type: 'RECORD', fields:[{name: "planName", type: 'STRING'},{name: "isCommitmentPlan", type: 'BOOLEAN'},{name: "commitmentInterval", type: 'RECORD', fields:[{name: "startTime", type: 'TIMESTAMP'},{name: "endTime", type: 'TIMESTAMP'}]}]},
        {name: "seats", type: 'RECORD', fields:[{name: "kind", type: 'STRING'},{name: "licensedNumberOfSeats", type: 'INTEGER'},{name: "numberOfSeats", type: 'INTEGER'},{name: "maximumNumberOfSeats", type: 'INTEGER'}]},
        {name: "trialSettings", type: 'RECORD', fields:[{name: "isInTrial", type: 'BOOLEAN'},{name: "trialEndTime", type: 'TIMESTAMP'}]},
        {name: "renewalSettings", type: 'RECORD', fields:[{name: "kind", type: 'STRING'},{name: "renewalType", type: 'STRING'}]},
        {name: "transferInfo", type: 'RECORD', fields:[{name: "transferabilityExpirationTime", type: 'TIMESTAMP'},{name: "minimumTransferableSeats", type: 'INTEGER'}]},
        {name: "purchaseOrderId", type: 'STRING'},
        {name: "status", type: 'STRING'},
        {name: "suspensionReasons", type: 'STRING', mode:'REPEATED'},
        {name: "resourceUiUrl", type: 'STRING'},
        {name: "customerDomain", type: 'STRING'},
        {name: "dealCode", type: 'STRING'},
        {name: "skuName", type: 'STRING'}
      ]
      
    }
  };
  table = BigQuery.Tables.insert(table, projectId, datasetId);

  try{
    var data = getData();
    // Create the data upload job.
    var job = {
      configuration: {
        load: {
          destinationTable: {
            projectId: projectId,
            datasetId: datasetId,
            tableId: tableId
          },
          sourceFormat: "NEWLINE_DELIMITED_JSON"
        }
      }
    };
    job = BigQuery.Jobs.insert(job, projectId, data);
    console.log('Load job started. Check on the status of it here: ' +
               'https://bigquery.cloud.google.com/jobs/%s', projectId);
  }catch(e){
    console.error(e);
  }
}
