var SSID = 'insert_ssid';

function doGet(){
  return HtmlService.createTemplateFromFile('page').evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function dailyTask(){
  listAllCustomerDomain();
}
