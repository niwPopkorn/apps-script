function isCustomer(targetDomain){
  
  var sheet = SpreadsheetApp.openById(SSID).getSheetByName('Data');
  var allDomains = sheet.getRange(2,1,sheet.getLastRow(),2).getValues();
  
  for(var i in allDomains){
    
    if(targetDomain == allDomains[i][0]){
      var customerId = allDomains[i][1];
      var domain = AdminDirectory.Domains.list(customerId).domains;
      var superAdmins = AdminDirectory.Users.list({customer:customerId,query:"isAdmin=true"}).users;
      var delegatedAdmins = AdminDirectory.Users.list({customer:customerId,query:"isDelegatedAdmin=true"}).users;
      var subscriptions = AdminReseller.Subscriptions.list({customerId:customerId}).subscriptions;
      
      var obj = {
        "domain":allDomains[i][0],
        "details":domain,
        "superAdmins":superAdmins,
        "delegatedAdmins":delegatedAdmins,
        "subscriptions":subscriptions,
        "cloudDns":CloudDNS.hasCloudDNS(targetDomain)
      }
      
      return obj;
    }
  }
  
  var noAccessDomains = getNoAccessDomains();
  var obj ={
    "domain":targetDomain,
    "noAccessDomains":noAccessDomains,
    "isRegistered":isRegistered(targetDomain)
  }
  
  return obj;
}

function getNoAccessDomains(){
  var sheet = SpreadsheetApp.openById(SSID).getSheetByName('Data');
  var domains = JSON.parse(sheet.getRange('C2').getValues());
  
  return domains;
}

function listAllCustomerDomain() {
  
  var allDomains = [];
  var noAccessDomains = [];
  var allCustomerIds = [];
  var pageToken, page;
  
  do {
    page = AdminReseller.Subscriptions.list({
      maxResults: 100,
      pageToken: pageToken
    });
    var subscriptions = page.subscriptions;
    if (subscriptions) {
      for (var i = 0; i < subscriptions.length; i++) {
        var subscription = subscriptions[i];
        var customerId = subscription.customerId;
        var customerDomain = subscription.customerDomain;
        allCustomerIds.push(customerId);
      }
    } else {}
    pageToken = page.nextPageToken;
  } while (pageToken);
  
  var _ = load();
  allCustomerIds = _.uniq(allCustomerIds);
  
  
  for(var i in allCustomerIds){
    var customerId = allCustomerIds[i];
    listDomains(customerId,allDomains,noAccessDomains);
  }
  
  var sheet = SpreadsheetApp.openById(SSID).getSheetByName('Data');
  sheet.getRange(2,1,allDomains.length,allDomains[0].length).setValues(allDomains);
  sheet.getRange('C2').setValue(JSON.stringify(noAccessDomains));
}

function listDomains(customerId,allDomains,noAccessDomains){
  try{
    var domains = AdminDirectory.Domains.list(customerId).domains;
    
    var primaryDomain;
    
    for(var i in domains){
      if(domains[i].isPrimary == true){
        primaryDomain = domains[i].domainName;
      }
    }
    
    for(var i in domains){
      var domain = domains[i].domainName;
      allDomains.push([domain,customerId]);
    }
    
  }catch(e){
    var domain = AdminReseller.Customers.get(customerId);
    noAccessDomains.push(domain.customerDomain);
  }
  
}

function isRegistered(domain){
  try{
    var response = AdminReseller.Customers.get(domain);
    return true;
  }catch(e){
    return false
  }
}
