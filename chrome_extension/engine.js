// Engine to extract content from the Web into JSON objects.
//
// The class w2j.Engine forms the public API of this module.

var w2j = w2j || {};
w2j.engine = {};

// *************************************************************************
// Await for tab loaded

/**
@private {Object.<string, function()>}
*/
w2j.engine.tabsOnUpdated_ = {};

/**
@param {number} tabId
@param {string} status
@return {string}
*/
w2j.engine.getTabStatusKey_ = function(tabId, status) {
  return tabId + ':' + status;
}

/**
@param {number} tabId
@param {string} status
@return {Promise}
*/
w2j.engine.tabStatusUpdated = function(tabId, status) {
  var key = w2j.engine.getTabStatusKey_(tabId, status);
  var callbacks = w2j.engine.tabsOnUpdated_[key];
  if (!callbacks) {
    callbacks = [];
    w2j.engine.tabsOnUpdated_[key] = callbacks;
  }
  return new Promise((resolve, reject) => {
    callbacks.push(resolve);
  });
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status) {
    var key = w2j.engine.getTabStatusKey_(tabId, changeInfo.status);
    var callbacks = w2j.engine.tabsOnUpdated_[key];
    delete w2j.engine.tabsOnUpdated_[key];
    if (callbacks) w2j.utils.forEach(callbacks, callback => { callback(); });
  }
});

// *************************************************************************
// Engine class

/**
@param {Tab?} opt_tab
@constructor
*/
w2j.Engine = function(opt_tab) {
  // @private {Tab}
  this.tab_ = opt_tab;
};

/**
@private
*/
w2j.Engine.prototype.injectScripts_ = async function() {
  await chromp.tabs.executeScript(this.tab_.id, {file: 'utils.js'});
  await chromp.tabs.executeScript(this.tab_.id, {file: 'engine_cs.js'});
};

/**
@param {*} object
@return {Promise}
*/
w2j.Engine.prototype.mapObject_ = async function(object) {
  var response = await chromp.tabs.sendMessage(this.tab_.id, {_w2j_: 'mapObject', objectToMap: object});
  return response.mappedObject;
};

/**
@param {string} url
@param {*} obj
@return {*}
*/
w2j.Engine.prototype.get = async function(url, object) {
  await chromp.tabs.update(this.tab_.id, {url: url});
  await w2j.engine.tabStatusUpdated(this.tab_.id, 'complete');
  await this.injectScripts_(this.tab_.id);
  return await this.mapObject_(object);
};

/**
@param {{url: string,
         nextPageSelector: string,
         maxPages: number}} params
@param {*} obj
@return {*}
*/
w2j.Engine.prototype.pages = async function(params, object) {
  var result = [];
  var url = params.url;
  var pageIndex = 0;
  while (url && (!params.maxPages || pageIndex < params.maxPages)) {
    var mappedObject = await this.get(url, {
      obj: object,
      nextPageUrl: params.nextPageSelector
    });
    // TODO: Need a proper way to handle relative URLs
    url = 'https://www.google.com' + mappedObject.nextPageUrl;
    result.push(mappedObject.obj);
    ++pageIndex;
  }
  return result;
};