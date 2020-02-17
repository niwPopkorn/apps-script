function logConsoleMessage(returnMessage,message){
  return returnMessage += '\n'+message;
}

function createAdminForCustomer(obj){
  
  var primaryEmail,givenName,familyName,isAdmin,password,changePasswordAtNextLogin;
  
  primaryEmail = obj.adminUsername;
  
  if(primaryEmail.indexOf('@') < 0){
    primaryEmail += '@'+obj.customerDomain;
  }
  
  givenName = obj.adminFirstname;
  familyName = obj.adminLastname;
  password = obj.customerDomain+'1234';
  changePasswordAtNextLogin = true;
  
  var userResource = {
    "kind": "admin#directory#user",
    "primaryEmail": primaryEmail,
    "name": {
      "givenName": givenName,
      "familyName": familyName
    },
    "password": password,
    "changePasswordAtNextLogin": changePasswordAtNextLogin
  };
  
  var user = AdminDirectory.Users.insert(userResource);
  AdminDirectory.Users.makeAdmin({"status": true}, primaryEmail);
}

function createRecordForHTMLTemplate(recordId){
  var record = loadRecord(recordId);
  var templateRec = new templateRecord();
  
  for(var i in templateRec){
    templateRec[i] = record[i];
  }
  
  return templateRec;
}

function templateRecord() {
  var record = {
              recordId:'',
              customerDomain:'',
              organizationName:'',
              contactName:'',
              contactEmail:'',
              addressLine1:'',
              addressLine2:'',
              addressLine3:'',
              locality:'',
              region:'',
              postalCode:'',
              phoneNumber:'',
              adminFirstname:'',
              adminLastname:'',
              adminUsername:'',
              alternateEmail:'',
              skuId:'',
              seats:''
            }
  return record;
}

function createCustomerResource(record){
  var customerResource = 
      {
        "kind": "reseller#customer",
        "customerId": record.customerDomain,
        "customerDomain": record.customerDomain,
        "postalAddress": {
          "kind": "customers#address",
          "contactName": record.contactName,
          "organizationName": record.organizationName,
          "locality": record.locality,
          "region": record.region,
          "postalCode": record.postalCode,
          "countryCode": "TH",
          "addressLine1": record.addressLine1,
          "addressLine2": record.addressLine2,
          "addressLine3": record.addressLine3
        },
        "phoneNumber": record.phoneNumber,
        "alternateEmail": record.alternateEmail
      };
  return customerResource;
}

function createSubscriptionResource(obj){
  var subscriptionResource =
      {
        "kind": "reseller#subscription",
        "customerId": obj.customerId,
        "skuId": obj.skuId,
        "plan": {
          "planName": "TRIAL"
        },
        "seats": {
          "kind": "subscriptions#seats",
          "maximumNumberOfSeats": obj.seats
        }
      }
  
  return subscriptionResource;
}

function sendEmail(obj){
  var domain = obj.customerDomain;
  var subject = '['+domain+'] การดำเนินการเกี่ยวกับ DNS records';
  var template = HtmlService.createTemplateFromFile('Email: Domain provisioning complete');
  template.contactName = obj.contactName;
  template.domain = domain;
  template.url = 'https://admin.google.com/'+domain+'/AdminHome#Home:autoDnsFlow=VERIFY_DOMAIN&autoDnsState=initiateAutoDnsFlow';
  template.username = obj.adminUsername;
  template.password = obj.customerDomain+'1234'
  
  var html = template.evaluate().getContent();
  
  GmailApp.sendEmail(getNiwpopkornEmail(), subject, '', {htmlBody:html});
}

function getNiwpopkornEmail(){
  var resellerEmail = Session.getActiveUser().getEmail();
  var niwpopkornEmail = resellerEmail.replace('reseller.niwpopkorn.com','niwpopkorn.com');
  return niwpopkornEmail;
}
