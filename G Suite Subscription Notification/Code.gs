//parameter for snooze domain
var WEB_APP_URL = ScriptApp.getService().getUrl();
var SSID = 'insert_your_ssid';
var SHEETNAME = 'Snooze domain';
var SNOOZEDSHEETURL = 'insert_your_snoozed_ssid';

function doPost(e){
  var domain = e.parameter.domain;
  var endDate = e.parameter.endDate;
  var subscriptionId = e.parameter.subscriptionId;
  var customerId = e.parameter.customerId;
  
  var action = e.parameter.action;
  
  if(action == 'cancel_subscription'){
    try{
      console.log('action',action);
      sendCancelEmail(customerId,subscriptionId);
    }catch(e){
      console.log('Code.gs line 28', e);
    }      
  }else if(action == 'renew_confirmed' || action == undefined){
    try{
      console.log('action',action);
      sendConfirmationEmail(customerId,subscriptionId);
    }catch(e){
      console.log('Code.gs line 34', e);
    }
  }
  
  var sheet = SpreadsheetApp.openById(SSID).getSheetByName(SHEETNAME);
  sheet.appendRow([domain,endDate]);
  
  var template = HtmlService.createTemplateFromFile('Snooze');
  template.domain = domain;
  
  return template.evaluate();
}
