var w2j = w2j || {};
w2j.utils = {};

w2j.utils.map = function(arr, fn, opt_obj) {
  var result = [];
  for (var i = 0; i < arr.length; ++i) {
    result.push(fn.call(opt_obj, arr[i]));
  }
  return result;
};

w2j.utils.forEach = function(arr, fn, opt_obj) {
  for (var i = 0; i < arr.length; ++i) {
    fn.call(opt_obj, arr[i]);
  }
};
