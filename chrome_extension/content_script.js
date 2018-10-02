// Content script injected in Chrome tabs
//
// This content script provides an API to extract content from a web page within
// a Chrome tab

var w2j = {cs: {}};

// *************************************************************************
// Messaging with the background page

w2j.cs.port = null;

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name != 'w2j-cs') return;
  w2j.cs.port = port;
  port.onMessage.addListener(w2j.cs.onMessage);
  port.onDisconnect.addListener(function() {
    w2j.cs.port = null;
  });
});

w2j.cs.postMessage = function(msg) {
  if (w2j.cs.port) w2j.cs.port.postMessage(msg);
};

w2j.cs.onMessage = function(msg) {
};

// *************************************************************************


document.body.addEventListener('click', function() {
  w2j.cs.postMessage({text: 'click'});
}, true); 
