class OOClient{
  static registerSignOnStatusListener(htmlElement){
    if (!this.signOnListenerArray)this.signOnListenerArray=[];
    this.signOnListenerArray.push(htmlElement);
  }
  static signOnStatusChanged(isSignedIn) {
    console.log("OOClient.signOnStatusChanged:"+isSignedIn);
    this.signOnListenerArray.forEach(function(htmlElement) {
      htmlElement.signOnStatusChanged(isSignedIn,htmlElement);
    });
  }
}