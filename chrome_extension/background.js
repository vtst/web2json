// Background page for the extension.

var w2j = {bg: {}};

// *************************************************************************
// Main functions

w2j.bg.executeScripts = function(tabId, scripts, callback) {
  function iter(i) {
    if (i == scripts.length) {
      callback();
    } else {
      chrome.tabs.executeScript(tabId, scripts[i], function() { iter(i+1); });
    }
  }
  iter(0);
};

w2j.bg.extract = function(tab) {
  w2j.bg.executeScripts(tab.id, [
    {file: 'utils.js'},
    {file: 'content_script.js'}
  ], function() {
    var port = chrome.tabs.connect(tab.id, {name: 'w2j-cs'});
    port.onMessage.addListener(function(msg) {
      alert('BG: ' + JSON.stringify(msg, null, 2));
    });
    port.postMessage({
      queries: [
        {
          type: 'querySelectorAll',
          selector: 'a/[href]'
        }
      ]
    });
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

