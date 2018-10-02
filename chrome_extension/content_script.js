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
    ;;
  case 'querySelectorAll':
    var elements = document.querySelectorAll(
      w2j.cs.getSelectorLHS(query.selector));
    return w2j.utils.map(elements,
                         w2j.cs.processElementForQuery.bind(null, query));
    ;;
  }
};

// *************************************************************************
// Messaging with the background page

w2j.cs.port = null;

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name != 'w2j-cs') return;
  w2j.cs.port = port;
  port.onMessage.addListener(w2j.cs.onMessage);
  port.onDisconnect.addListener(function() {
    w2j.cs.port = null;
  });
});

w2j.cs.postMessage = function(msg) {
  if (w2j.cs.port) w2j.cs.port.postMessage(msg);
};

w2j.cs.onMessage = function(msg) {
  if (msg.queries) {
    w2j.cs.postMessage({
      results: w2j.utils.map(msg.queries, w2j.cs.executeQuery)
    });
  }
};
