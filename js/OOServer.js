class OOServer{
  static initializeServerAndClient(ooRootFolderName,callbackFunktion){
    this.callServer("getFolderById",ooRootFolderName,callbackFunktion);
  }
  
  
  static serverInitialized(resp){
    console.log(this);
    console.log(resp);
    this.callbackFunktion(resp);
  }
  
  
  static callServer(functionName,parameters,callbackFunktion) {
    this.callbackFunktion=callbackFunktion;
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
  }).then(this.serverInitialized);
}
}