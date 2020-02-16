function listExpiringSubscriptions(){
  console.log('start');
  
  var nextPageToken;
  
  do{
    Utilities.sleep(500);//ป้องกัน User Rate Limit Exceeded 
    
    var response = AdminReseller.Subscriptions.list({pageToken:nextPageToken,maxResults:100});
    var subscriptions = response.subscriptions;
    
    var activeSubscriptions = subscriptions.filter(function (subscription){return subscription.status == 'ACTIVE'});
    var hasStartTimeSubscriptions = activeSubscriptions.filter(function (subscription){return subscription.plan.commitmentInterval !== undefined});
    
    hasStartTimeSubscriptions.map(function (subscription){
      var endTime = new Date(Number(subscription.plan.commitmentInterval.endTime));
      var diff = diffDays(endTime); 
      if(diff == 60||diff == 30||diff == 15||diff == 7||diff == 1){//need change
        console.log("line 51; customerId:%s customerDomain:%s diff:%s",subscription.customerId,subscription.customerDomain,diff);
        sendNotificationEmail(subscription,diff);
      }
    });
    
    nextPageToken = response.nextPageToken;
  }while(nextPageToken != null)
  
}

function diffDays(endTime){
  var today = new Date();
  var diff = endTime - today.getTime();
  return parseInt(diff/(1000*60*60*24));
}

function sendNotificationEmail(subscription,diff){
  
  var domain = AdminReseller.Customers.get(subscription.customerId).customerDomain;
  var isSnoozedDomain = false;
  
  try{
    var snoozedDomains = getSnoozedDomain();
    
    for(var i in snoozedDomains){
      var snoozedDomain = snoozedDomains[i][0];
      
      if(domain == snoozedDomain){
        isSnoozedDomain = true;
      }
    }
  }catch(e){
    console.log(e);
  }
  
  console.log("domain:%s isSnoozed:%s",domain,isSnoozedDomain);
  
  if(!isSnoozedDomain){
    var seats = subscription.seats.numberOfSeats;
    var endTime = new Date(Number(subscription.plan.commitmentInterval.endTime));
    var endDate = Utilities.formatDate(endTime, Session.getScriptTimeZone(), 'dd MMM yyyy');
    
    var subscriptions = getSubscriptions(subscription.customerId);
    
    //check clouddns
    //if(CheckCloudDNS.hasCloudDNS(domain)){
    //  subscriptions.push({'domain':domain,'sku':'Cloud DNS','seats':'1','endDate':'G Suite'});
    //}
    
    var template = HtmlService.createTemplateFromFile('Email: Renewal Notification');
    template.remainingDays = diff;
    template.subscriptions = subscriptions;
    template.endDate = endDate;
    template.domain = domain;
    template.subscriptionId = subscription.subscriptionId;
    template.customerId = subscription.customerId;
    
    var webappURL = ScriptApp.getService().getUrl();
    template.appURL = webappURL+'?domain='+domain;
    template.scriptURL = webappURL;
    
    var htmlBody = template.evaluate().getContent();
    
    var subject = diff+' days ['+domain+'] Remind renew G Suite '+seats+' users expire on '+endDate;
    var body = template.evaluate().getContent();
    
    var sales = salesLookup(domain);
    if(sales.indexOf('Domain not found') > -1){
      GmailApp.sendEmail(RECIPIENT2, subject,"", {cc:RECIPIENT1,htmlBody:body});
    }else{
      GmailApp.sendEmail(sales, subject,"", {cc:RECIPIENT1+','+RECIPIENT2,htmlBody:body});
    }
    
    console.log('email sent');
  }
  
}
  
function sendConfirmationEmail(customerId,subscriptionId){
  console.log('customerId', customerId);
  console.log('subscriptionId', subscriptionId);
  var domain, seats, startDate, endDate;
  var subscription = AdminReseller.Subscriptions.get(customerId, subscriptionId);
  
  domain = subscription.customerDomain;
  seats = subscription.seats.numberOfSeats;
  
  var endTime = new Date(Number(subscription.plan.commitmentInterval.endTime));
  startDate = Utilities.formatDate(endTime, Session.getScriptTimeZone(), 'dd MMM yyyy');
  var newEndTime = new Date(endTime.setFullYear(endTime.getFullYear()+1));
  endDate = Utilities.formatDate(newEndTime,Session.getScriptTimeZone(),'dd MMM yyyy');
  
  var subscriptions = getSubscriptions(subscription.customerId);
  
  var template = HtmlService.createTemplateFromFile('Email: Renewal Confirmation');
  template.domain = domain;
  template.seats = seats;
  template.startDate = startDate;
  template.endDate = endDate;
  template.subscriptions = subscriptions;
  
  var htmlBody = template.evaluate().getContent();
  var subject = domain+': Renewal Order Confirmation '+Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy');
  GmailApp.sendEmail(RECIPIENT2+','+RECIPIENT1, subject, '', {htmlBody:htmlBody});
  console.log('send confirmation email');
}
  
function sendCancelEmail(customerId,subscriptionId){
  var domain, seats, startDate, endDate;
  var subscription = AdminReseller.Subscriptions.get(customerId, subscriptionId);
  
  domain = subscription.customerDomain;
  seats = subscription.seats.numberOfSeats;
  
  var endTime = new Date(Number(subscription.plan.commitmentInterval.endTime));
  startDate = Utilities.formatDate(endTime, Session.getScriptTimeZone(), 'dd MMM yyyy');
  var newEndTime = new Date(endTime.setFullYear(endTime.getFullYear()+1));
  endDate = Utilities.formatDate(newEndTime,Session.getScriptTimeZone(),'dd MMM yyyy');
  
  var template = HtmlService.createTemplateFromFile('Email: Cancel Confirmation');
  template.domain = domain;
  template.seats = seats;
  template.startDate = startDate;
  template.endDate = endDate;
  
  var htmlBody = template.evaluate().getContent();
  var subject = domain+': Subscription Cancel '+Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy');
  GmailApp.sendEmail(RECIPIENT2+','+RECIPIENT1, subject, '', {htmlBody:htmlBody});
}

function getSnoozedDomain(){
  var sheet = SpreadsheetApp.openById(SSID).getSheetByName(SHEETNAME);
  var data = sheet.getRange(2, 1, sheet.getLastRow()-1, 1).getValues();
  return data;
}

function getSubscriptions(customerId){
  
  var response = AdminReseller.Subscriptions.list({customerId:customerId});
  var subscriptions = response.subscriptions;
  
  var output = [];
  
  for(var i in subscriptions){
    var subscription = subscriptions[i];
    var domain = subscription.customerDomain;
    var sku = subscription.skuName;
    
    if(subscription.seats){
      if(subscription.seats.numberOfSeats){
        var seats = subscription.seats.numberOfSeats;
      }else{
        var seats = subscription.seats.licensedNumberOfSeats;
      }
    }
    
    try{
      var endTime = new Date(Number(subscription.plan.commitmentInterval.endTime));
      var endDate = Utilities.formatDate(endTime, Session.getScriptTimeZone(), 'dd MMM yyyy');
    }catch(e){
      var endTime = null
    }
    
    if(seats > 0){
      var obj = {domain:domain,sku:sku,seats:seats,endDate:endDate};
      output.push(obj);
    }
  }
  
  return output;
}

function salesLookup(domain,ssid) {
  var ss = SpreadsheetApp.openById(ssid);
  var sheet = ss.getSheetByName('Data');
  
  var data = sheet.getRange('A1:A'+sheet.getLastRow()).getValues();
  
  for(var i = data.length-1; i>=0; i--){
    var record = JSON.parse(data[i][0]);
    if(record.customerDomain == domain){
      return record.submittedBy;
    }
  }
  
  return 'Domain not found';
}  
