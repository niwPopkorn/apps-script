function getCustomerInformation(domain){
  var seats;
  var subscriptions = AdminReseller.Subscriptions.list({customerId:domain}).subscriptions;
  for(var i in subscriptions){
    if(subscriptions[i].skuId == 'Google-Apps-For-Business'){
      seats = subscriptions[i].seats.numberOfSeats;
    }
  }
  
  var customer = AdminReseller.Customers.get(domain);
  var company = customer.postalAddress.organizationName;
  var contactName = customer.postalAddress.contactName;
  var address1 = customer.postalAddress.addressLine1;
  var address2 = customer.postalAddress.addressLine2;
  var address3 = customer.postalAddress.addressLine3;
  var postal = customer.postalAddress.postalCode;
  var telephone = customer.phoneNumber;
  
  var obj = {seats:seats,company:company,contactName:contactName,address1:address1,address2:address2,address3:address3,postal:postal,telephone:telephone};
  return obj;
}

function thisDateNextYear(time){
  var date = new Date(Number(time));
  date.setFullYear(date.getFullYear()+1);
  return date;
}
