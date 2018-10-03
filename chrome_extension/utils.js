var w2j = w2j || {};
w2j.utils = {};

// *************************************************************************
// Arrays

w2j.utils.map = function(arr, fn, opt_obj) {
  var result = [];
  for (var i = 0; i < arr.length; ++i) {
    result.push(fn.call(opt_obj, arr[i]));
  }
  return result;
};

w2j.utils.forEach = function(arr, fn, opt_obj) {
  for (var i = 0; i < arr.length; ++i) {
    fn.call(opt_obj, arr[i], i);
  }
};

// *************************************************************************
// Promisify

w2j.utils.cloneArguments = function(args) {
  var result = [];
  for (var i = 0; i < args.length; ++i) result.push(args[i]);
  return result;
}

w2j.promisify = function(fn, argument_names) {
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
