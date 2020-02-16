var serviceName = 'clouddns';
var clientID = 'insert_client_id';
var secret = 'insert_client_secret';
var scope = 'https://www.googleapis.com/auth/ndev.clouddns.readonly';

function authCallback(request) {
  var service = getService();
  var isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function clouddnsListDomains(){
  var response = clouddnsAPI();
  var managedZones = JSON.parse(response).managedZones;
  
  var domains = [];
  
  domains = managedZones.map(function(zone){
                              var domain = zone.dnsName;
                              return domain.substring(0,domain.length-1);
                              });
  
  return domains;
}

function hasCloudDNS(domain){
  var clouddnsDomains = clouddnsListDomains();
  if(clouddnsDomains.indexOf(domain)>-1){
    return true;
  }else{
    return false;
  }
}

function clouddnsAPI() {
  var service = getService();
  if (service.hasAccess()) {
  
    var projectName = 'cloud-dns-156608';
    var requestURL = 'https://www.googleapis.com/dns/v1beta2/projects/'+projectName+'/managedZones';
    
    var headers = {
      "Authorization": "Bearer " + getService().getAccessToken()
    };
    
    var options = {
      "headers": headers,
      "method" : "GET",
      "muteHttpExceptions": true
    };
    
    var response = UrlFetchApp.fetch(requestURL, options);
    
    return response.getContentText();
    
  } else {
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
  }
}

function getService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService(serviceName)

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(clientID)
      .setClientSecret(secret)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to request (space-separated for Google services).
      .setScope(scope)

      // Below are Google-specific OAuth2 parameters.

      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline')

      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      .setParam('approval_prompt', 'force');
}
