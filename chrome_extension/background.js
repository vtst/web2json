// Background page for the extension.

var w2j = {bg: {}};

// *************************************************************************
// Interaction with content page

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

w2j.bg.executeQueries = function(tabId, queries, callback) {
  w2j.bg.executeScripts(tabId, [
    {file: 'utils.js'},
    {file: 'content_script.js'}
  ], function() {
    chrome.tabs.sendMessage(tabId, {queries: queries}, callback);
  });
};

// *************************************************************************
// Main functions

w2j.bg.extract = function(tab) {
  var queries = [
    {
      type: 'querySelectorAll',
      selector: 'a/[href]'
    }
  ];
  w2j.bg.executeQueries(tab.id, queries, function(response) {
    alert('BG: ' + JSON.stringify(response, null, 2));
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

