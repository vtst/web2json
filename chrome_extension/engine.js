var w2j == w2j || {};
w2j.lib = {};

// *************************************************************************
// Await for tab loaded

/**
@private {Object.<string, function()>}
*/
w2j.lib.tabsOnUpdated_ = {};

/**
@param {number} tabId
@param {string} status
@return {string}
*/
w2j.lib.getTabStatusKey_ = function(tabId, status) {
  return tabId + ':' + status;
}

/**
@param {number} tabId
@param {string} status
@return {Promise}
*/
w2j.lib.tabStatusUpdated = function(tabId, status) {
  var key = w2j.lib.getTabStatusKey_(tabId, status);
  var callbacks = w2j.lib.tabsOnUpdated_[key];
  if (!callbacks) {
    callbacks = [];
    w2j.lib.tabsOnUpdated_[key] = callbacks;
  }
  return new Promise((resolve, reject) => {
    callbacks.push(resolve);
  });
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status) {
    var key = w2j.lib.getTabStatusKey_(tabId, changeInfo.status);
    var callbacks = w2j.lib.tabsOnUpdated_[key];
    delete w2j.lib.tabsOnUpdated_[key];
    if (callbacks) w2j.utils.forEach(callbacks, callback => { callback(); });
  }
});

// *************************************************************************
// Internal API

/**
@param {Tab} tab
*/
w2j.lib.injectScripts = async function(tab) {
  await chromp.tabs.executeScript(tab.id, {file: 'utils.js'});
  await chromp.tabs.executeScript(tab.id, {file: 'content_script.js'});
};

/**
@param {Tab} tab
@param {string} url
@param {*} obj
*/
w2j.lib.get = async function(tab, url, obj) {
  await chromp.tabs.update(tab.id, {url: url});
  await w2j.lib.tabStatusUpdated(tab.id, 'complete');
  await w2j.lib.injectScripts(tab.id);
  return await chromp.tabs.sendMessage(tab.id, {objectToMap: obj});
};

// *************************************************************************
// Public API

var W2J = {
  get: w2j.lib.get
};