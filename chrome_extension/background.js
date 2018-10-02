// Background page for the extension.

var w2j = {bg: {}};

// *************************************************************************
// Main functions

w2j.bg.extract = function(tab) {
  chrome.tabs.executeScript({
    file: 'content_script.js'
  });
  var port = chrome.tabs.connect(tab.id, {name: 'w2j-cs'});
  port.postMessage({text: "Knock knock"});
  port.onMessage.addListener(function(msg) {
    alert('BG: ' + msg.text);
  });
};

// *************************************************************************
// Context menus

chrome.contextMenus.create({
  id: 'extract',
  title: 'Extract Web to JSON'
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == 'extract') {
    w2j.bg.extract(tab);
  }
});

