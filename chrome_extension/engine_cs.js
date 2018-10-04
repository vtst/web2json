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
    } else {
      return element;
    }
  }
};

/**
@param {Node} rootNode
@param {string} selector
@return {*}
*/
w2j.cs.get = function(rootNode, selector) {
  var parsedSelector = w2j.cs.parseSelector(selector);
  var element = parsedSelector.body ? rootNode.querySelector(parsedSelector.body) : rootNode;
  if (element) return w2j.cs.processElementForQuerySelector(parsedSelector, element);
  else return null;
};

/**
@param {Node} rootNode
@param {string} selector
@return {Array.<*>}
*/
w2j.cs.getAll = function(rootNode, selector) {
  var parsedSelector = w2j.cs.parseSelector(selector);
  var elements = parsedSelector.body ? rootNode.querySelectorAll(parsedSelector.body) : [rootNode];
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

w2j.cs.map = function(rootNode, rootObject) {
  return w2j.cs.mapObject(rootObject, function(object) {
    switch (object._w2j_) {
    case 'get':
      var got = w2j.cs.get(rootNode, object.selector);
      if (got && object.cont) {
        return w2j.cs.map(got, object.cont);
      } else {
        return got;
      }
    case 'getAll':
      var gots = w2j.cs.getAll(rootNode, object.selector);
      if (object.cont) {
        return w2j.utils.map(gots, function(got) {
          return w2j.cs.map(got, object.cont);
        });
      } else {
        return gots;
      }
    default:
      return object;
    }
  });
};

// *************************************************************************
// Messaging with the background page

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.objectToMap) {
    sendResponse({
      mappedObject: w2j.cs.map(document, request.objectToMap)
    });
  }

});
