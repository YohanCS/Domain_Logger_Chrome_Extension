
// displays current protocol + domain in popup as plain text step 2 
var currentTab;
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  currentTab = tabs[0];

  var url = new URL(currentTab.url)
  var domain = url.hostname
  let protocol = currentTab.url.match(/\w*/g)[0];

  let urlDiv = document.getElementById('urlDisplay');
  let textnode = document.createTextNode("Domain on: " + protocol +"://" +
                                         domain); 
  

  urlDiv.appendChild(textnode);

});


// step 3: displays all network domains in a table
var port = chrome.runtime.connect({name: "domains"});
port.onMessage.addListener(function(msg) {
  if (msg.request == "addList")
    addList(msg.domains); // object with tabId keys to object of keys as domains
});
port.postMessage({hello: "send"});

// add all domains under this tabID to table 
// domains: object with tabId keys to object of keys as domains
var keysUsedSoFar = {};
function addList(domains) {

  let table = document.getElementById('tableDomain')
  for(key in domains[currentTab.id]) {
    if(!(key in keysUsedSoFar)) {
      var tr = document.createElement('tr');
      var td = tr.appendChild(document.createElement('td'));
      td.innerHTML = key; 
      table.appendChild(tr); 
      keysUsedSoFar[key] = 0;
    }
  }

  let text = document.getElementById('total');
  text.innerHTML = Object.keys(keysUsedSoFar).length;
}


// step 4: clear button, sends msg through part to background to clear
// and does internal div clear as well
function clear() {
  chrome.storage.local.set({cache: {}}, function() {
    
  });
  const myNode = document.getElementById("tableDomain"); 
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
  keysUsedSoFar = {}; 
  let text = document.getElementById('total');
  text.innerHTML = Object.keys(keysUsedSoFar).length;
}

let refreshButton = document.getElementById('refresh');
refreshButton.onclick = function(element) {
  port.postMessage({hello: "send"});
};

let clearButton = document.getElementById('clear');
clearButton.onclick = function(element) {
  clear(); 
}


// design to change user agent string depending on value clicked
let selectedMenu = document.getElementById("agents");
let changeStringButton = document.getElementById("changeString");
let clearStringButton = document.getElementById("clearString");

// should change userstring to this
changeStringButton.onclick = function(element) {
  chrome.storage.local.set({user: selectedMenu.value});
}

clearStringButton.onclick = function(element) {
  chrome.storage.local.remove("user", function() {
    //console.log("removed user string");
  })
}


    




