function loadRecord(recordId){
  var dataSheet = SpreadsheetApp.openById(DATA_SSID).getSheetByName(DATA_SHEETNAME);
  var allRecord = dataSheet.getRange(1, 1, dataSheet.getLastRow(), 1).getValues();
  
  var row;
  
  for(var i = allRecord.length-1; i>=0; i--){
    var record = JSON.parse(allRecord[i][0]);
    if(record.recordId == recordId){
      return record;
    }
  }
}

function findRecord(recordId){
  var dataSheet = SpreadsheetApp.openById(DATA_SSID).getSheetByName(DATA_SHEETNAME);
  var allRecord = dataSheet.getRange(1, 1, dataSheet.getLastRow(), 1).getValues();
  
  for(var i = allRecord.length-1; i>=0; i--){
    var record = JSON.parse(allRecord[i][0]);
    if(record.recordId == recordId){
      return Number(i)+1;
    }
  }
}

function saveRecord(record){
  var sheet = SpreadsheetApp.openById(DATA_SSID).getSheetByName(DATA_SHEETNAME);
  var row = findRecord(record.recordId);
  var range = sheet.getRange(row, 1).setValue(JSON.stringify(record));
}
