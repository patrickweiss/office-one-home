//Weil die ECMA6 class nur so tut als sei sie eine Klasse, nutze ich den traditionellen Prototype Contructor um ein Singleton zu simulieren
/*global localStorage, gapi*/


/**
 * Repräsentiert einen GoogleDrive Ordner im Client
 * @param {String} mobileLabel 
 * @param {String} driveName
 * @param {String} driveId
 * @return {OOFolder} 
 */
var OOFolder = function(mobileLabel, driveName, driveId) {
    return { mobileLabel: "Archiv", driveName: "", driveId: "" };
};





//Konstruktorfunktion für OOC Singleton
var OOClient = function() {
  var self = this;

  self.loadObjectById = function(id) {
    return JSON.parse(localStorage.getItem(id));
  };

  self.saveObjectById = function(object, id) {
    localStorage.setItem(id, JSON.stringify(object));
  };

  self.registerSignOnStatusListener = function(htmlElement) {
    self.signOnListenerArray.push(htmlElement);
  };

  self.getOrCreateRootFolder = function(name,callingElement,callbackFunction) {
    self.BM.rootFolder.driveName = name;
    OOS.getOrCreateFolderByName(self.BM.rootFolder.driveName, self.setRootFolder);
    self.getOrCreateRootFolderCallbackFunction=callbackFunction;
    self.getOrCreateRootFolderCallingELement=callingElement;
  };

  self.signOnStatusChanged = function(isSignedIn) {
    console.log("OOClient.signOnStatusChanged:" + isSignedIn);
    self.isSignedIn = isSignedIn;
    self.signOnListenerArray.forEach(function(htmlElement) {
      htmlElement.signOnStatusChanged(isSignedIn, htmlElement);
    });
  };

  self.setRootFolder = function(resp) {
    console.log(resp);
    self.BM.rootFolder.driveId=resp.result.response.result;
    self.saveObjectById(self.BM, "BM");
    console.log("BM aktualsisiert:");
    console.log(self.BM);
    self.getOrCreateRootFolderCallbackFunction(self.getOrCreateRootFolderCallingELement);
  };
  
  self.addAusgabe = function (buchungsperiode,betrag,konto,belegurl){
    var ausgabenArray=JSON.parse(localStorage.getItem("ausgabe"+buchungsperiode));
    if (!ausgabenArray)ausgabenArray=[];
    var neueAusgabe={buchungsperiode:buchungsperiode,betrag:betrag,konto:konto,belegurl:belegurl};
    ausgabenArray.push(neueAusgabe);
    localStorage.setItem("ausgabe"+buchungsperiode,JSON.stringify(ausgabenArray));
  };
  

  //BM steht für "BusinessModell"
  //Das Javascript Objekt enthält alle Geschäftsdaten in Form von weiteren JavaScript Objekten, welche der Client anzeigt, erzeugt, ändert oder löscht
  self.BM = self.loadObjectById("BM");
  //Beim ersten Aufruf der Anwendung gibt es noch kein Business Model und es muss initialisiert werden
  if (!self.BM) {
    self.BM = {};
    self.BM.rootFolder = new OOFolder("Archiv", "", "");
    self.BM.konten = [
      { ID: "Porto", Konto: "GUV", MwSt: "7%" },
      { ID: "Benzin", Konto: "GUV", MwSt: "19%" },
      { ID: "Hotel", Konto: "GUV", MwSt: "19%" }
    ];
    self.saveObjectById(self.BM, "BM");
  }
  self.signOnListenerArray = [];
  
 
};

//Globales OOClient Singleton
var OOC = new OOClient();


//Konstruktorfunktion für OOS Singleton
var OOServer = function() {
  var self = this;

  /**
   * Sucht oder erzeugt einen Ordner in GoogleDrive, erzeugt daraus ein OOFolder und gibt diesen zurück
   * @param {String} driveName
   * @param {function} callbackFunction
   * @return {OOFolder} 
   */
  self.getOrCreateFolderByName = function(folderName, callbackFunktion) {
    self.callServer("getOrCreateFolderByName", [folderName], callbackFunktion);
  };

  /**
   * Ruft per Rest ein Google App Script Funktion auf und liefert deren return Wert zurück
   * @param {String} functionName
   * @param {String} parameters
   * @param {function} callbakFunction
   *
   */
  self.callServer = function(functionName, parameters, callbackFunktion) {
    self.callbackFunktion = callbackFunktion;
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
        'function': functionName,
        'parameters': parameters 
      }
    }).then(callbackFunktion);
  };

};

//Globales OOServer Singleton
var OOS = new OOServer();

// Key aus OORestAPI, weiss noch nicht wofür der gut ist...
var OORestAPIID = "MD63cf3nzAL_2sNVT2SrufBrwxofbW-GS";
var OORestAPIGCPClientID="55763199609-f68c4lephs94o5bin4cbm13l4pi5rshl.apps.googleusercontent.com";
var OORestAPIGCPKey="xVTYW8PGrZeq-iip4a-xoSu2";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS_AppsScript = ["https://script.googleapis.com/$discovery/rest?version=v1","https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';


/*global gapi,OOC*/
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
  /*if (!isSignedIn)gapi.auth2.getAuthInstance().signIn();
  if (isSignedIn){
    callScriptFunction("getFolderById");
    OOGoogleConnector.getOrCreateOOFolder();
  }*/
  OOC.signOnStatusChanged(isSignedIn);
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


