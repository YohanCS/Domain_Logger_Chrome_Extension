chrome.runtime.onInstalled.addListener(function() {
    /* chrome.storage.sync.set({color: '#3aa757'}, function() {
      console.log("The color is green.");
    }); */ 

    // extension tells browser when the user can interact with the html page
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {pathPrefix: ''}, // so it matches all tabs
        })],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    }); 

    // set connected variable to false 
    chrome.storage.local.set({connected: false, cache: {}}, function() {
      //console.log("Connected is false so far");
    });

    // then add listener that will send domainList once it gets hello msg
    chrome.runtime.onConnect.addListener(function(port) {
      console.assert(port.name == "domains");

      port.onMessage.addListener(function(msg) {

        if (msg.hello == "send") {

          chrome.storage.local.set({connected: true}, function() {
            //console.log("Connected is true now");
          });

          chrome.storage.local.get('cache', function(data) {
            port.postMessage({request: "addList", domains: data.cache});
          });
          
        }        
      });

      // disconnect listener
      port.onDisconnect.addListener(function() {
        chrome.storage.local.set({connected: false}, function() {
          //console.log("Connected closed now");
        });
      });

    });

    // whenever a webrequest is made, add to map in chrome storage
    // and if connected is true, also send it as one to popup.js 
    chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
      var url = new URL(details.url)
      var domain = url.hostname
      var protocol = details.url.match(/\w*/g)[0];
      var together = protocol + "://" + domain;

      // then add to chrome storage
      chrome.storage.local.get('cache', function(data) {
        let cache = data.cache; 

        if(details.tabId in cache) {
          let tabMap = cache[details.tabId];
          tabMap[together] = 0; // we just want the unique key 
        }
        else {
          // ES6 to use the variable together instead of string together
          cache[details.tabId] = {[together]: 0}; 
        }

        chrome.storage.local.set({cache: cache}, function() {
          //console.log(cache);
          //console.log("updated cache for tabid"); 
        })
        console.log(details);
      });

      // changing user agent 
      chrome.storage.local.get('user', function(data) {
        if(data.user != undefined) {
          for (var i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name === 'User-Agent') {
              details.requestHeaders[i].value = data.user; 
              console.log(data.user);
              break;
            }
          }
          
        }
      });
      return {requestHeaders: details.requestHeaders};

      
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
    );

  });

  

chrome.runtime.onInstalled 

