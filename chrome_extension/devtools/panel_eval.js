var w2j = w2j || {};
w2j.panel_cs = {};

/**
@param {Element} element
@return {Array.<string>}
*/
w2j.panel_cs.getClassNames = function(element) {
  var classNames = [];
  for (var i = 0; i < element.classList.length; ++i) {
    classNames.push(element.classList.item(i));
  }
  return classNames;  
};

/**
@param {Element} element
@return {w2j.panel.ElementInfo}
*/
w2j.panel_cs.inspectElement = function(element) {
  return {
    tagName: element.tagName.toLowerCase(),
    classNames: w2j.panel_cs.getClassNames(element),
    id: element.id
  };
};

/**
@param {Element} element
@return {Array.<w2j.panel.ElementInfo>}
*/
w2j.panel_cs.inspectAncestorElements = function(element) {
  var current = element;
  var result = [];
  while (current instanceof Element) {
    result.push(w2j.panel_cs.inspectElement(current));
    current = current.parentNode;
  }
  return result;
};

return w2j.panel_cs.inspectAncestorElements($0);
