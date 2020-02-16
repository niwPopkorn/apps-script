function listSubscription() {
  var pageToken, page;
  var output = [];
  
  do {
    page = AdminReseller.Subscriptions.list({
      pageToken: pageToken
    });
    
    var subscriptions = page.subscriptions;
    
    if (subscriptions) {
      output = output.concat(subscriptions);  
    } else {
      console.log('No subscriptions found.');
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  
  return output;
}

function getData(){
  try{
    var jsonData = listSubscription();
    for(var i in jsonData){
    try{
      jsonData[i].creationTime = jsonData[i].creationTime/1000;
    }catch(e){}
    
    try{
      jsonData[i].plan.commitmentInterval.endTime = jsonData[i].plan.commitmentInterval.endTime/1000;
    }catch(e){}
    
    try{
      jsonData[i].plan.commitmentInterval.startTime = jsonData[i].plan.commitmentInterval.startTime/1000;
    }catch(e){}
    
    try{
      jsonData[i].transferInfo.transferabilityExpirationTime = jsonData[i].transferInfo.transferabilityExpirationTime/1000;
    }catch(e){}
    
    try{
      jsonData[i].trialSettings.trialEndTime = jsonData[i].trialSettings.trialEndTime/1000;
    }catch(e){}
  }
  
  var string = '';
  
  for(var i in jsonData){
    if(i == jsonData.length){
      string += JSON.stringify(jsonData[i])
    }else{
      string += JSON.stringify(jsonData[i])+"\n";
    }
  }
  
  var data = Utilities.newBlob(string, 'application/octet-stream', 'subscriptions.json');
  return data;
  }catch(e){
    throw e;
  }
}
