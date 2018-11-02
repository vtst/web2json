var w2j = w2j || {};
w2j.utils = {};

// *************************************************************************
// Arrays

/**
@param {Array.<T>} arr
@param {function(this: C, T, number): S} fn
@param {?C} opt_obj
@return {Array.<S>}
@template C, T, S
*/
w2j.utils.map = function(arr, fn, opt_obj) {
  var result = [];
  for (var i = 0; i < arr.length; ++i) {
    result.push(fn.call(opt_obj, arr[i], i));
  }
  return result;
};

/**
@param {Array.<T>} arr
@param {function(this: C, T, number): boolean} fn
@param {?C} opt_obj
@return {Array.<T>}
@template C, T
*/
w2j.utils.filter = function(arr, fn, opt_obj) {
  var result = [];
  for (var i = 0; i < arr.length; ++i) {
    var elt = arr[i];
    if (fn.call(opt_obj, elt, i)) result.push(elt);
  }
  return result;
};

/**
@param {Array.<T>} arr
@param {function(this: C, T, number)} fn
@param {?C} opt_obj
@template C, T
*/
w2j.utils.forEach = function(arr, fn, opt_obj) {
  for (var i = 0; i < arr.length; ++i) {
    fn.call(opt_obj, arr[i], i);
  }
};

/**
@param {Object.<K, V>} obj
@param {function(this: C, V, K): W}
@param {?C} opt_obj
@return {Object.<K, W>}
@template C, K, V, W
*/
w2j.utils.mapObject = function(obj, fn, opt_obj) {
  var result = {};
  for (var key in obj) {
    result[key] = fn.call(opt_obj, obj[key], key);
  }
  return result;
};

/**
@param {string} url
@param {string} base
@return {string}
*/
w2j.utils.relativeUrl = function(url, base) {
  return url && (new URL(url, base)).href;
};

/**
@private {Object.<string, string>}
*/
w2j.utils.PACKAGE_FILES_CACHE_ = [];

/**
@param {string} path
@return {string}
*/
w2j.utils.getFileContentFromPackage = async function(path) {
  var cached = w2j.utils.PACKAGE_FILES_CACHE_[path];
  if (cached) return cached;
  const url = chrome.runtime.getURL(path);
  var response = await fetch(url);
  var text = await response.text();
  w2j.utils.PACKAGE_FILES_CACHE_[path] = text;
  return text;
};

/**
@param {string} path
@return {{result: *, isException: *}}
*/
w2j.utils.evalScriptInInspectedWindow = async function(path) {
  var script = await w2j.utils.getFileContentFromPackage(path);
  script = '(function() {' + script + '})();';
  return await chromp.devtools.inspectedWindow.eval(script);
};

// *************************************************************************
// Promises

w2j.utils.onContentLoaded = function(opt_document) {
  var doc = opt_document || document;
  return new Promise((resolve, reject) => {
    var object = {};
    object.handler = function(event) {
      doc.removeEventListener('DOMContentLoaded', object.handler);
      resolve(event);
    }
    doc.addEventListener('DOMContentLoaded', object.handler);
  });
};

// *************************************************************************
// Promisify

/**
@param {Arguments} args
@return {Array.<*>}
*/
w2j.utils.cloneArguments = function(args) {
  var result = [];
  for (var i = 0; i < args.length; ++i) result.push(args[i]);
  return result;
}

/**
@param {function()} fn
@param {Array.<string>} callbackArgumentNames
@return {function()}
*/
w2j.promisify = function(fn, callbackArgumentNames) {
  if (!fn) return null;
  return function() {
    var arguments_for_fn = w2j.utils.cloneArguments(arguments);
    return new Promise((resolve, reject) => {
      function callback() {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          if (callbackArgumentNames) {
            var arg = {};
            w2j.utils.forEach(callbackArgumentNames, (argumentName, i) => {
              arg[argumentName] = arguments[i];
            });
            resolve(arg);
          } else {
            resolve(arguments[0]);
          }
        }
      };
      arguments_for_fn.push(callback);
      fn.apply(null, arguments_for_fn);
    });
  }
};

// *************************************************************************
// Promisify

var chromp = {};
if (chrome.tabs) {
  chromp.tabs = {};
  chromp.tabs.create = w2j.promisify(chrome.tabs.create);
  chromp.tabs.executeScript = w2j.promisify(chrome.tabs.executeScript);
  chromp.tabs.remove = w2j.promisify(chrome.tabs.remove);
  chromp.tabs.sendMessage = w2j.promisify(chrome.tabs.sendMessage);
  chromp.tabs.update = w2j.promisify(chrome.tabs.update);
}

if (chrome.devtools) {
  chromp.devtools = {};
  if (chrome.devtools.inspectedWindow) {
    chromp.devtools.inspectedWindow = {};
    chromp.devtools.inspectedWindow.eval = w2j.promisify(
      chrome.devtools.inspectedWindow.eval, ['result', 'isException']);
  }
}
