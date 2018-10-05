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
@private
@param {*} pattern
@return {Promise}
*/
w2j.Engine.prototype.getFromPattern_ = async function(pattern) {
  var response = await chromp.tabs.sendMessage(this.tab_.id, {_w2j_: 'getFromPattern', pattern: pattern});
  return response.result;
};

/**
@param {string} url
@param {*} pattern
@return {*}
@private
*/
w2j.Engine.prototype.getOne_ = async function(url, pattern) {
  await chromp.tabs.update(this.tab_.id, {url: url});
  await w2j.engine.tabStatusUpdated(this.tab_.id, 'complete');
  await this.injectScripts_(this.tab_.id);
  return await this.getFromPattern_(pattern);
};

/**
@param {Array.<string>} urls
@param {*} pattern
@return {Array.<*>}
@private
*/
w2j.Engine.prototype.getMultiple_ = async function(urls, pattern) {
  var result = [];
  for (var i = 0; i < urls.length; ++i) {
    var item = await this.getOne_(urls[i], pattern);
    result.push(item);
  }
  return result;
};

/**
@param {string|Array.<string>} urlOrUrls
@param {*} obj
@return {*}
*/
w2j.Engine.prototype.get = function(urlOrUrls, pattern) {
  if (urlOrUrls instanceof Array) return this.getMultiple_(urlOrUrls, pattern);
  else return this.getOne_(urlOrUrls, pattern);
};

/**
@param {{url: string,
         nextPageSelector: string,
         maxPages: number}} params
@param {*} obj
@return {*}
*/
w2j.Engine.prototype.getPagined = async function(params, pattern) {
  var results = [];
  var url = params.url;
  var pageIndex = 0;
  while (url && (!params.maxPages || pageIndex < params.maxPages)) {
    var result = await this.get(url, {
      pattern: pattern,
      nextPageUrl: params.nextPageSelector
    });
    url = w2j.utils.relativeUrl(result.nextPageUrl, url);
    results.push(result.pattern);
    ++pageIndex;
  }
  return results;
};