var W2J = {};

W2J.get = function(selector) {
  return {_w2j_: 'get', selector: selector};
};

W2J.getAll = function(selector) {
  return {_w2j_: 'getAll', selector: selector};
};
