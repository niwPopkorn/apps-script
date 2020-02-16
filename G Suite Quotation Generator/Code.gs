var SALEPERSON = 'insert_email';
var UNIT_COST = 35;
var DEFAULT_EXRATE = 34;
var DEFAULT_UNIT_PRICE = 1700;
var DEFAULT_VALIDITY = 30;

//template for create quotation file
var TEMPLATE_ID = 'insert_id_of_template_file';
var ROOT_FOLDER_ID = 'insert_root_folder_id';
var FOLDER_ID = 'insert_folder_id';
var COSTSHEET_FOLDER_ID = 'insert_folder_costsheet_folder_id';


function doGet(e){
  var domain = e.parameter.domain;
  var template = HtmlService.createTemplateFromFile('page');
  var customer = getCustomerInformation(domain);
  
  template.domain = domain;
  template.seats = customer.seats;
  template.company = customer.company;
  template.contactName = customer.contactName;
  template.address1 = customer.address1;
  template.address2 = customer.address2;
  template.address3 = customer.address3;
  template.postal = customer.postal;
  template.telephone = customer.telephone;
  template.cost = UNIT_COST*customer.seats*DEFAULT_EXRATE;
  template.unitPrice = DEFAULT_UNIT_PRICE;
  template.validity = DEFAULT_VALIDITY;
  return template.evaluate().setTitle('Generate Quotation').setSandboxMode(HtmlService.SandboxMode.NATIVE);
}

function makeFileFromTemplate(obj){
  //update customer information
  var company = obj.company;
  var contactName = obj.contactName;
  var address1 = obj.address1;
  var address2 = obj.address2;
  var address3 = obj.address3;
  var postal = obj.postal;
  var telephone = obj.telephone;
  
  var customerResource = AdminReseller.Customers.get(obj.domain);
  customerResource.postalAddress.contactName = contactName;
  customerResource.postalAddress.organizationName = company;
  customerResource.postalAddress.postalCode = postal;
  customerResource.postalAddress.addressLine1 = address1;
  customerResource.postalAddress.addressLine2 = address2;
  customerResource.postalAddress.addressLine3 = address3;
  customerResource.phoneNumber = telephone;

  try{
    AdminReseller.Customers.update(customerResource, obj.domain);
  }catch(e){
    console.log(e);
  }
  
  var domain = obj.domain;
  var qno = obj.qno;
  var email = obj.email;
  var exRate = obj.exRate;
  var cost = obj.cost;
  var unitPrice = obj.unitPrice;
  var validity = obj.validity;
  var payment = obj.payment;
  
  var date = Utilities.formatDate(new Date(), 'GMT+0700', 'dd MMM yyyy')
  var sheetName = 'parameter';
  
  var templateId = TEMPLATE_ID;
  var rootFolderId = ROOT_FOLDER_ID;
  var folderId = FOLDER_ID;
  var costSheetFolderId = COSTSHEET_FOLDER_ID;
  
  //parameter
  var domainRange,seatsRange,exRateRange,companyRange,contactNameRange,addressRange,telephoneRange,emailRange,dateRange,startRange,endRange,qnoRange,costRange,unitPriceRange,validityRange,paymentRange;
  domainRange = 'B2';
  seatsRange = 'B3';
  exRateRange = 'B4';
  costRange = 'B5';
  companyRange = 'B6';
  contactNameRange = 'B7';
  addressRange = 'B8';
  telephoneRange = 'B9';
  emailRange = 'B10';
  dateRange = 'B11';
  startRange = 'B12';
  endRange = 'B13';
  qnoRange = 'B14';
  unitPriceRange = 'B15';
  validityRange = 'B16';
  paymentRange = 'B17';
  
  var newDocId = DriveApp.getFileById(templateId).makeCopy().getId();
  var newDocFile = DriveApp.getFileById(newDocId);
  var ss = SpreadsheetApp.openById(newDocFile.getId());
  var sheet = ss.getSheetByName(sheetName);
  
  //set value in parameter
  sheet.getRange(domainRange).setValue(domain);
  
  var seats,start,end;
  var subscriptions = AdminReseller.Subscriptions.list({customerId:domain}).subscriptions;
  for(var i in subscriptions){
    if(subscriptions[i].skuId == 'Google-Apps-For-Business'){
      seats = subscriptions[i].seats.numberOfSeats;
      start = subscriptions[i].plan.commitmentInterval.startTime;
      end = subscriptions[i].plan.commitmentInterval.endTime;
    }
  }
  
  //file manager
  var docName = qno+' '+domain+' '+'Renew Google Apps '+seats+' users';

  newDocFile.setName(docName);
  newDocFile.addEditor(SALEPERSON);
  
  var folder = DriveApp.getFolderById(folderId);
  folder.addFile(newDocFile);
  
  var costSheetFolder = DriveApp.getFolderById(costSheetFolderId);
  costSheetFolder.addFile(newDocFile);
  
  DriveApp.getFolderById(rootFolderId).removeFile(newDocFile);//remove file from root folder unless file will shown in 2 folders
  //file manager
  
  var customer = AdminReseller.Customers.get(domain);
  var company = customer.postalAddress.organizationName;
  var contactName = customer.postalAddress.contactName;
  var address = customer.postalAddress.addressLine1;
  var telephone = customer.phoneNumber;
  
  if(customer.postalAddress.addressLine2 == ''){
    address += ' '+customer.postalAddress.addressLine2;
  }
  
  if(customer.postalAddress.addressLine3 == ''){
    address += ' '+customer.postalAddress.addressLine3;
  }
  address += ' '+customer.postalAddress.postalCode;
  
  sheet.getRange(seatsRange).setValue(seats);
  sheet.getRange(exRateRange).setValue(exRate);
  sheet.getRange(costRange).setValue(cost);
  sheet.getRange(companyRange).setValue(company);
  sheet.getRange(contactNameRange).setValue(contactName);
  sheet.getRange(addressRange).setValue(address);
  sheet.getRange(telephoneRange).setValue(telephone);
  sheet.getRange(emailRange).setValue(email);
  sheet.getRange(dateRange).setValue(new Date());
  var newStart = thisDateNextYear(start);
  var newEnd = thisDateNextYear(end);
  sheet.getRange(startRange).setValue(new Date(Number(newStart)));
  sheet.getRange(endRange).setValue(new Date(Number(newEnd)));
  sheet.getRange(qnoRange).setValue(qno);
  sheet.getRange(unitPriceRange).setValue(unitPrice);
  sheet.getRange(validityRange).setValue(validity);
  sheet.getRange(paymentRange).setValue(payment);
  
  var subscriptionRange = 'A47';
  var quotationSheetName = 'Page-1';
  var range = ss.getSheetByName(quotationSheetName).getRange(subscriptionRange);
  var start = Utilities.formatDate(sheet.getRange(startRange).getValue(), Session.getScriptTimeZone(), 'dd MMM yyyy');
  var end = Utilities.formatDate(sheet.getRange(endRange).getValue(), Session.getScriptTimeZone(), 'dd MMM yyyy');
  var str = 'Subscription Start : '+start+' - End: '+end;
  range.setValue(str);
  
  var emailtemplate = HtmlService.createTemplateFromFile('Email: Quotation complete');
  emailtemplate.sheetURL = ss.getUrl();
  emailtemplate.scriptURL = ScriptApp.getService().getUrl();
  emailtemplate.downloadURL = getExportURL(ss,'pdf');
  emailtemplate.downloadXLSURL = getExportURL(ss,'xlsx');
  var body = emailtemplate.evaluate().getContent();
  
  GmailApp.sendEmail(RECIPIENT2, 'Quotation for '+domain+' is ready', '', {htmlBody:body});
}
