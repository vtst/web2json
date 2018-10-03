var W2J = {};

W2J.get = function(selector, cont) {
  return {_w2j_: 'get', selector: selector, cont: cont};
};

W2J.getAll = function(selector, cont) {
  return {_w2j_: 'getAll', selector: selector, cont: cont};
};
