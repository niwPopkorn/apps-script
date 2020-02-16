var BIGQUERY_PROJECTID = 'replace_bq_project_id';
var BIGQUERY_DATASETID = 'replace_bq_dataset_id';

function dailyTask(){
  var projectId = BIGQUERY_PROJECTID;
  var datasetId = BIGQUERY_DATASETID;
  loadDataToBigQuery(projectId,datasetId);
}
