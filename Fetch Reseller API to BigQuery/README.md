This script fetch data from Reseller API and update to BigQuery for analytics

To use this script
1. Update your BQ project and dataset in Code.gs
2. Create trigger for function dailyTask()

The account that runs this script need access to Reseller API.
(Optiona) You can uncomment the line
//  deleteTableData(10);
10 is a defualt numbers of table that will be kept but you can change this number.

in dailyTask() function if you need to maintain number of table in BQ
