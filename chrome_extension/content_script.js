// Content script injected in Chrome tabs
//
// This content script provides an API to extract content from a web page within
// a Chrome tab

var w2j = w2j || {};
w2j.cs = {};

// *************************************************************************
// Query execution

w2j.cs.getAttributes = function(element) {
  var result = {};
  w2j.utils.forEach(element.attributes, function(attribute) {
    result[attribute.nodeName] = attribute.nodeValue;
  });
  return result;
};

w2j.cs.processElementForQuery = function(query, element) {
  var selectorRHS = w2j.cs.getSelectorRHS(query.selector);
  if (!selectorRHS) selectorRHS = '*';
  switch (selectorRHS) {
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
    if (selectorRHS.substr(0, 1) == '[' &&
        selectorRHS.substr(selectorRHS.length -1, 1) == ']') {
      return element.getAttribute(
        selectorRHS.substr(1, selectorRHS.length - 2));
    }
  }
};

w2j.cs.getSelectorLHS = function(selector) {
  return selector.split('/')[0];
};

w2j.cs.getSelectorRHS = function(selector) {
  return selector.split('/')[1];
};

w2j.cs.executeQuery = function(query) {
  switch (query.type) {
  case 'querySelector':
    var element = document.querySelector(w2j.cs.getSelectorLHS(query.selector));
    return w2j.cs.processElementForQuery(query, element);
  case 'querySelectorAll':
    var elements = document.querySelectorAll(
      w2j.cs.getSelectorLHS(query.selector));
    return w2j.utils.map(elements,
                         w2j.cs.processElementForQuery.bind(null, query));
  }
};

w2j.cs.executeQueries = function(queries) {
  return w2j.utils.map(queries, w2j.cs.executeQuery);
};

// *************************************************************************
// Extractor

w2j.cs.get = function(obj) {
  function map(node) {
    if (typeof node === 'object') {
      if (node instanceof Array) {
        return w2j.utils.map(node, map);
      } else if (!node._w2j_) {
        return w2j.utils.mapObject(node, map);
      } else {
        switch (node._w2j_) {
          case 'get':
            return w2j.cs.executeQuery({type: 'querySelector', selector: node.selector});
          case 'getAll':
            return w2j.cs.executeQuery({type: 'querySelectorAll', selector: node.selector});
        }
      }
    }
    return node;
  }
  return map(obj);
};

// *************************************************************************
// Messaging with the background page

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.queries) {
    sendResponse({
      results: w2j.cs.executeQueries(request.queries)
    });
  }
  if (request.get) {
    sendResponse({
      result: w2j.cs.get(request.get)
    });
  }

});
chrome.runtime.sendMessage(null, {title: document.title});
