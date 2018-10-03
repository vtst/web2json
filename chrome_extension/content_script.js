// Content script injected in Chrome tabs
//
// This content script provides an API to extract content from a web page within
// a Chrome tab

var w2j = w2j || {};
w2j.cs = {};

// *************************************************************************
// Query execution

/**
@typedef {{body: string, extension: string}}
*/
w2j.cs.ParsedSelector;

/**
@param {string} selector
@return w2j.cs.ParsedSelector
*/
w2j.cs.parseSelector = function(selector) {
  var i = selector.lastIndexOf('/');
  if (i < 0) return {body: selector, extension: ''};
  else return {body: selector.substring(0, i), extension: selector.substring(i + 1)};
};

/**
@param {Element} element
@return {Object.<string, string>}
*/
w2j.cs.getAttributes = function(element) {
  var result = {};
  w2j.utils.forEach(element.attributes, function(attribute) {
    result[attribute.nodeName] = attribute.nodeValue;
  });
  return result;
};

/**
@param {w2j.cs.ParsedSelector} parsedSelector
@param {Element} element
@return {*}
*/
w2j.cs.processElementForQuerySelector = function(parsedSelector, element) {
  if (!parsedSelector.extension) parsedSelector.extension = '*';
  switch (parsedSelector.extension) {
  case '*':
    return {
      textContent: element.textContent,
      innerHTML: element.innerHTML,
      attributes: w2j.cs.getAttributes(element)
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
    }
  }
};

/**
@param {string} selector
@return {*}
*/
w2j.cs.get = function(selector) {
  var parsedSelector = w2j.cs.parseSelector(selector);
  var element = document.querySelector(parsedSelector.body);
  return w2j.cs.processElementForQuerySelector(parsedSelector, element);
};

/**
@param {string} selector
@return {Array.<*>}
*/
w2j.cs.getAll = function(selector) {
  var parsedSelector = w2j.cs.parseSelector(selector);
  var elements = document.querySelectorAll(parsedSelector.body);
  return w2j.utils.map(
    elements,
    w2j.cs.processElementForQuerySelector.bind(null, parsedSelector));
};

// *************************************************************************
// Extractor

w2j.cs.mapObject = function(obj, fn, opt_context) {
  if (typeof obj === 'object') {
    if (obj instanceof Array) {
      return w2j.utils.map(obj, elt => { return w2j.cs.mapObject(elt, fn, opt_context); });
    } else if (obj._w2j_) {
      return fn.call(opt_context, obj);
    } else {
      return w2j.utils.mapObject(obj, elt => { return w2j.cs.mapObject(elt, fn, opt_context); });
    }
  } else {
    return obj;
  }
};

w2j.cs.map = function(root) {
  return w2j.cs.mapObject(root, function(node) {
    switch (node._w2j_) {
    case 'get':
      return w2j.cs.get(node.selector);
    case 'getAll':
      return w2j.cs.getAll(node.selector);
    default:
      return node;
    }
  });
};

// *************************************************************************
// Messaging with the background page

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.objectToMap) {
    sendResponse({
      mappedObject: w2j.cs.map(request.objectToMap)
    });
  }

});
