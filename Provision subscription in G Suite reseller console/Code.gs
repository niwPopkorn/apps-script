DATA_SSID = 'insert_ssid';
DATA_SHEETNAME = 'Data';

function doGet(e){
  var recordId = e.parameter.recordId;
  
  if(recordId){
    var recordForHTML = createRecordForHTMLTemplate(recordId);
    var template = HtmlService.createTemplateFromFile('page');
    template.formId = 'domainProvisioningForm';
    for(var i in recordForHTML){
      template[i] = recordForHTML[i];
    }
    
    return template.evaluate().setTitle('Domain Provisioning').setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }else{
    return HtmlService.createHtmlOutput('Please open this page from link in email')
  }
  
}

function HTMLSubmitHandler(formElement){
  //check if customer is exist
  var customer;
  var customerExist;
  var returnMessage = '';
  var domain = formElement.customerDomain;
  var skuId = formElement.skuId;
  
  if(skuId == "G Suite Basic"){
    skuId = "Google-Apps-For-Business"
  }else if(skuId == "G Suite Business"){
    skuId = "Google-Apps-Unlimited"
  }
  
  var seats = formElement.seats;
  
  try{
    customer = AdminReseller.Customers.get(domain);
    customerExist = true;
  }catch(e){
    customerExist = false;
  }
  
  if(!customerExist){//new customer
    try{
      var customerResource = createCustomerResource(formElement);
    }catch(e){
      return returnMessage += e.message+' createCustomerResource(obj);<br>';
    }
    
    //create customer
    try{
      var customer = AdminReseller.Customers.insert(customerResource);
      returnMessage = logConsoleMessage(returnMessage,'สร้างลูกค้าในระบบเรียบร้อย');
    }catch(e){
      console.log('customer', customer);
      returnMessage = logConsoleMessage(returnMessage,'AdminReseller.Customers.insert() ไม่สำเร็จ '+e.message);
    }
    
    try{
      var subscriptionResource = createSubscriptionResource({customerId:customer.customerId,skuId:skuId,seats:seats});
    }catch(e){
      returnMessage += e.message+' createSubscriptionResource();<br>';
    }
    //create trial subscription
    
    try{
      AdminReseller.Subscriptions.insert(subscriptionResource, customer.customerId);
      returnMessage = logConsoleMessage(returnMessage,'สร้าง subscription ในระบบเรียบร้อย');
    }catch(e){
      returnMessage = logConsoleMessage(returnMessage,'สร้าง subscription ในระบบ ไม่สำเร็จ '+e.message);
    }
    
    try{
        createAdminForCustomer(formElement);
      returnMessage = logConsoleMessage(returnMessage,'สร้าง admin เรียบร้อย');
    }catch(e){
      returnMessage = logConsoleMessage(returnMessage,'สร้าง admin ไม่สำเร็จ '+e.message);
    }
    
    try{
      sendEmail(formElement);
    }catch(e){
      returnMessage += e.message+' error with code sendEmail(obj);<br>';
    }
    
  }else{
    returnMessage += 'ลูกค้าสมัคร Google Apps ไว้แล้ว ไปทำจากหน้า reseller นะคับ';
    }
  
  if(returnMessage == ''){
    returnMessage = 'เสร็จแล้วคับ'
  }
  
  return returnMessage;
}
