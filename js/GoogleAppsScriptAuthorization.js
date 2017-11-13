// Key aus OORestAPI, weiss noch nicht wofür der gut ist...
var OORestAPIID = "MD63cf3nzAL_2sNVT2SrufBrwxofbW-GS";
var OORestAPIGCPClientID="55763199609-f68c4lephs94o5bin4cbm13l4pi5rshl.apps.googleusercontent.com";
var OORestAPIGCPKey="xVTYW8PGrZeq-iip4a-xoSu2";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS_AppsScript = ["https://script.googleapis.com/$discovery/rest?version=v1","https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';


/*global gapi,OOClient*/
/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
  gapi.load('client:auth2', initClientAppsScript);
  
}
/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClientAppsScript() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS_AppsScript,
    clientId: OORestAPIGCPClientID,
    scope: SCOPES
  }).then(function() {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

  });
}
/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  console.log("Google login Status AppsScriptApi:"+isSignedIn);
  //if (!isSignedIn)gapi.auth2.getAuthInstance().signIn();
  if (isSignedIn){
    callScriptFunction("getFolderById");
    OOGoogleConnector.getOrCreateOOFolder();
  }
  OOClient.signOnStatusChanged(isSignedIn);
}
/*gibt Ordner im Rootfolder des Benutzer auf der Console aus, um zu testen ob Rest Aufruf funktioniert*/
function callScriptFunction(functionName,parameters) {
  // https://script.google.com/a/saw-office.net/d/1YopGVrTwTcISoE_KoqvJ3pJc7n317uaFFxoiWVZ4l6EMXXdGOdSuZ6qx/edit?usp=drive_web
  // Datei -->Projekteigenschaften --> Projektschlüssel
  var scriptId = "MD63cf3nzAL_2sNVT2SrufBrwxofbW-GS";

  // Call the Execution API run method
  //   'scriptId' is the URL parameter that states what script to run
  //   'resource' describes the run request body (with the function name
  //              to execute)
  gapi.client.script.scripts.run({
    'scriptId': scriptId,
    'resource': {
      'function': functionName
    }
  }).then(function(resp) {
    var result = resp.result;
       console.log(result);
    if (result.error && result.error.status) {
      // The API encountered a problem before the script
      // started executing.
      console.log('Error calling API:');
      console.log(JSON.stringify(result, null, 2));
    }
    else if (result.error) {
      // The API executed, but the script returned an error.

      // Extract the first (and only) set of error details.
      // The values of this object are the script's 'errorMessage' and
      // 'errorType', and an array of stack trace elements.
      var error = result.error.details[0];
      console.log('Script error message: ' + error.errorMessage);

      if (error.scriptStackTraceElements) {
        // There may not be a stacktrace if the script didn't start
        // executing.
        console.log('Script error stacktrace:');
        for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
          var trace = error.scriptStackTraceElements[i];
          console.log('\t' + trace.function+':' + trace.lineNumber);
        }
      }
    }
    else {
      // The structure of the result will depend upon what the Apps
      // Script function returns. Here, the function returns an Apps
      // Script Object with String keys and values, and so the result
      // is treated as a JavaScript object (folderSet).

      var folderSet = result.response.result;
      if (Object.keys(folderSet).length == 0) {
        console.log('No folders returned!');
      }
      else {
        console.log('Folders under your root folder:');
        Object.keys(folderSet).forEach(function(id) {
          console.log('\t' + folderSet[id] + ' (' + id + ')');
        });
      }
    }
  });
}

class OOGoogleConnector{
  static getOrCreateOOFolder(){
    var OORootFolder= gapi.client.drive.files.list({
      "q": "fullText contains 'oofolderv0035'"
    })
        .then(function(response) {
          // Handle the results here (response.result has the parsed body).
          console.log("Response", response);
        }, function(error) {
          console.error("Execute error", error);
        });
    console.log("OORootFolder:");
    console.log(OORootFolder);
  }
}