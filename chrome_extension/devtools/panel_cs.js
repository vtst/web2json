var w2j = w2j || {};
w2j.panel_cs = {};

/**
@param {Element} element
@return {string}
*/
w2j.panel_cs.inspectElement = function(element) {
  var s = element.tagName;
  if (element.id) s += '#' + element.id;
  if (element.classList) {
    for (var i = 0; i < element.classList.length; ++i) {
      s += '.' + element.classList.item(i);
    }
  }
  return s;
};

w2j.panel_cs.inspectAncestors = function(element) {
  var current = element;
  var result = [];
  while (current) {
    result.push(w2j.panel_cs.inspectElement(current));
    current = current.parentNode;
  }
  return result;
};

return w2j.panel_cs.inspectAncestors($0);
