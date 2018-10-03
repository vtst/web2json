// Background page for the extension.

var w2j = w2j || {};
w2j.bg = {};

// *************************************************************************
// Promisify

w2j.chrome = {tabs: {}};

w2j.chrome.tabs.update = w2j.promisify(chrome.tabs.update);
w2j.chrome.tabs.executeScript = w2j.promisify(chrome.tabs.executeScript);
w2j.chrome.tabs.sendMessage = w2j.promisify(chrome.tabs.sendMessage);

// *************************************************************************
// Await for tab loaded

/**
@private {Object.<string, function()>}
*/
w2j.bg.tabsOnUpdated_ = {};

/**
@param {number} tabId
@param {string} status
@return {string}
*/
w2j.bg.getTabStatusKey_ = function(tabId, status) {
  return tabId + ':' + status;
}

/**
@param {number} tabId
@param {string} status
@return {Promise}
*/
w2j.bg.tabStatusUpdated = function(tabId, status) {
  var key = w2j.bg.getTabStatusKey_(tabId, status);
  var callbacks = w2j.bg.tabsOnUpdated_[key];
  if (!callbacks) {
    callbacks = [];
    w2j.bg.tabsOnUpdated_[key] = callbacks;
  }
  return new Promise((resolve, reject) => {
    callbacks.push(resolve);
  });
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status) {
    var key = w2j.bg.getTabStatusKey_(tabId, changeInfo.status);
    var callbacks = w2j.bg.tabsOnUpdated_[key];
    delete w2j.bg.tabsOnUpdated_[key];
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
  var response = await w2j.chrome.tabs.sendMessage(tab.id, {objectToMap: obj});
  return response;
};

// *************************************************************************
// Context menus

chrome.contextMenus.create({
  id: 'extract',
  title: 'Extract Web to JSON'
});

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
  if (info.menuItemId == 'extract') {
    var obj = {
      my_name: 'Vincent Simonet',
      hrefs: W2J.getAll('a/[href]')
    };
    var mappedObj = await w2j.bg.get(tab, 'http://www.vtst.net/', obj);
    console.log(mappedObj);
  }
});
