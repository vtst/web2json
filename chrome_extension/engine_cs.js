// Content script injected in Chrome tabs
//
// This content script provides an API to extract content from a web page within
// a Chrome tab

var w2j = w2j || {};
w2j.engine_cs = {};

// *************************************************************************
// Query execution

/**
@typedef {{body: string, extension: string}}
*/
w2j.engine_cs.ParsedSelector;

/**
@param {string} selector
@return w2j.engine_cs.ParsedSelector
*/
w2j.engine_cs.parseSelector = function(selector) {
  var i = selector.lastIndexOf('/');
  if (i < 0) return {body: selector, extension: ''};
  else return {body: selector.substring(0, i), extension: selector.substring(i + 1)};
};

/**
@param {Element} element
@return {Object.<string, string>}
*/
w2j.engine_cs.getAttributes = function(element) {
  var result = {};
  w2j.utils.forEach(element.attributes, function(attribute) {
    result[attribute.nodeName] = attribute.nodeValue;
  });
  return result;
};

/**
@param {w2j.engine_cs.ParsedSelector} parsedSelector
@param {Element} element
@return {*}
*/
w2j.engine_cs.processElementForQuerySelector = function(parsedSelector, element) {
  switch (parsedSelector.extension) {
  case '*':
    return {
      textContent: element.textContent,
      innerHTML: element.innerHTML,
      attributes: w2j.engine_cs.getAttributes(element)
    };
  case 'textContent':
    return element.textContent;
  case 'innerHTML':
    return element.innerHTML;
  default:
    if (parsedSelector.extension.substr(0, 1) == '[' &&
        parsedSelector.extension.substr(parsedSelector.extension.length -1, 1) == ']') {
      return element.getAttribute(
        parsedSelector.extension.substr(1, parsedSelector.extension.length - 2));
    } else {
      return element;
    }
  }
};

/**
@param {Node} node
@param {string} selector
@return {*}
*/
w2j.engine_cs.getOne = function(node, selector) {
  var parsedSelector = w2j.engine_cs.parseSelector(selector);
  var element = parsedSelector.body ? node.querySelector(parsedSelector.body) : node;
  if (element) return w2j.engine_cs.processElementForQuerySelector(parsedSelector, element);
  else return null;
};

/**
@param {Node} node
@param {string} selector
@return {Array.<*>}
*/
w2j.engine_cs.getAll = function(node, selector) {
  var parsedSelector = w2j.engine_cs.parseSelector(selector);
  var elements = parsedSelector.body ? node.querySelectorAll(parsedSelector.body) : [node];
  return w2j.utils.map(
    elements,
    w2j.engine_cs.processElementForQuerySelector.bind(null, parsedSelector));
};

// *************************************************************************
// Extractor

w2j.engine_cs.getType = function(object) {
  var t = typeof object;
  if (t == 'object' && object instanceof Array) return 'array';
  else return t;
}

w2j.engine_cs.mapObject = function(node, object) {
  if (!node) return;
  switch (w2j.engine_cs.getType(object)) {
  case 'object':
    var gotNode = object._on_ ? w2j.utils.getOne(node, object._on_) : node;
    return w2j.utils.mapObject(object, (value, key) => {
      if (key == '_on_') return undefined;
      else return w2j.engine_cs.mapObject(node, value);
    });
  case 'array':
    if (object.length == 0 || object.length > 2) throw 'Unexpected array length';
    var gotNodes = w2j.engine_cs.getAll(node, object[0]);
    if (object.length == 2) {
      return w2j.utils.map(gotNodes, gotNode => { return w2j.engine_cs.mapObject(gotNode, object[1]); });
    } else {
      return gotNodes;
    }
  case 'string':
    return w2j.engine_cs.getOne(node, object);
  default:
    return object;
  }
};

// *************************************************************************
// Content script API

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // TODO: Check sender
  if (request._w2j_ == 'mapObject') {
    sendResponse({
      mappedObject: w2j.engine_cs.mapObject(document, request.objectToMap)
    });
  }
});
