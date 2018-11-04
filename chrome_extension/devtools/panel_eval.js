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

/** @private {Object.<string, boolean>} */
w2j.panel_cs.ATTRIBUTES_ = {
  'name': true
};

/**
@param {Element} element
@return {Array.<string>}
*/
w2j.panel_cs.getAttributes = function(element) {
  var result = [];
  for (var i = 0; i < element.attributes.length; ++i) {
    var attribute = element.attributes[i];
    if (w2j.panel_cs.ATTRIBUTES_[attribute.name]) {
      result.push(attribute.name + '="' + attribute.value + '"');
    }
  }
  return result;
};

/**
@param {Element} element
@return {w2j.panel.ElementInfo}
*/
w2j.panel_cs.inspectElement = function(element) {
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id,
    classNames: w2j.panel_cs.getClassNames(element),
    attributes: w2j.panel_cs.getAttributes(element)
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
