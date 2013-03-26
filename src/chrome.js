var attachedTabs = {};
var version = "1.0";

// event listeners
chrome.browserAction.onClicked.addListener(actionClicked);
chrome.extension.onMessage.addListener(messageReceived);

// when you visit a page checks if its currently in your faves
function monitorPage() {

}     

// toolbar button clicked
function actionClicked(tab) {
  // checks if site currently exists
  chrome.tabs.insertCSS(null, { file:'src/save.css' }, function() {
    chrome.tabs.executeScript(null, { file: "lib/jquery.js" }, function() {
      chrome.tabs.executeScript(null, { file: "src/save.js" }, function() {
        chrome.tabs.executeScript(null, { file: "src/scrape.js" });
      });
    });
  });

}

// inject modal into live page
function injectModal() {

}

function messageReceived(request, sender, sendResponse) {
  
}