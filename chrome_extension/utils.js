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
}

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
@param {Array.<string>} argument_names
@return {function()}
*/
w2j.promisify = function(fn, argument_names) {
  if (!fn) return null;
  return function() {
    var arguments_for_fn = w2j.utils.cloneArguments(arguments);
    return new Promise((resolve, reject) => {
      function callback() {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          if (argument_names) {
            var arg = {};
            w2j.utils.forEach(argument_names, (argument_name, i) => {
              arg[argument_name] = arguments[i];
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
  chromp.tabs.update = w2j.promisify(chrome.tabs.update);
  chromp.tabs.executeScript = w2j.promisify(chrome.tabs.executeScript);
  chromp.tabs.sendMessage = w2j.promisify(chrome.tabs.sendMessage);
}