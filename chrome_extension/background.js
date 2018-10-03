// Background page for the extension.

var w2j = w2j || {};
w2j.bg = {};

// *************************************************************************
// Promisify

w2j.chrome = {tabs: {}};

w2j.chrome.tabs.update = w2j.promisify(chrome.tabs.update);
w2j.chrome.tabs.executeScript = w2j.promisify(chrome.tabs.executeScript);

// *************************************************************************
// Await for tab loaded

w2j.bg.tabsOnUpdated = {};

w2j.bg.tabStatusUpdated = function(tabId, status) {
  var key = tabId + ':' + status;
  console.log(key);
  var callbacks = w2j.bg.tabsOnUpdated[key];
  if (!callbacks) {
    callbacks = [];
    w2j.bg.tabsOnUpdated[key] = callbacks;
  }
  return new Promise((resolve, reject) => {
    callbacks.push(resolve);
  });
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status) {
    var key = tabId + ':' + changeInfo.status;
    var callbacks = w2j.bg.tabsOnUpdated[key];
    delete w2j.bg.tabsOnUpdated[key];
    if (callbacks) w2j.utils.forEach(callbacks, callback => { callback(); });
  }
});


// *************************************************************************
// Main functions

w2j.bg.injectScripts = async function(tab) {
  await w2j.chrome.tabs.executeScript(tab.id, {file: 'utils.js'});
  await w2j.chrome.tabs.executeScript(tab.id, {file: 'content_script.js'});
};

w2j.bg.get = async function(tab, url, obj) {
  await w2j.chrome.tabs.update(tab.id, {url: url});
  await w2j.bg.tabStatusUpdated(tab.id, 'complete');
  await w2j.bg.injectScripts(tab.id);
  var queries = [
    {
      type: 'querySelectorAll',
      selector: 'a/[href]'
    }
  ];
  chrome.tabs.sendMessage(tab.id, {queries: queries}, function(response) {
    alert('BG2: ' + JSON.stringify(response, null, 2));
  });
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
});



// *************************************************************************
// Context menus

chrome.contextMenus.create({
  id: 'extract',
  title: 'Extract Web to JSON'
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == 'extract') {
    // w2j.bg.extract(tab);
    w2j.bg.get(tab, 'http://www.vtst.net/').then(() => {}, error => alert(error));
  }
});
