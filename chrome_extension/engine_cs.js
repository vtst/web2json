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
// getFromPattern

/**
@param {*} object
@return {string}
*/
w2j.engine_cs.getType = function(object) {
  var t = typeof object;
  if (t == 'object' && object instanceof Array) return 'array';
  else return t;
};

/**
@param {Element} node
@param {*} pattern
@return {*}
*/
w2j.engine_cs.getFromPattern = function(node, pattern) {
  if (!node) return;
  switch (w2j.engine_cs.getType(pattern)) {
  case 'object':
    var gotNode = pattern._on_ ? w2j.utils.getOne(node, pattern._on_) : node;
    return w2j.utils.mapObject(pattern, (value, key) => {
      if (key == '_on_') return undefined;
      else return w2j.engine_cs.getFromPattern(node, value);
    });
  case 'array':
    if (pattern.length == 0 || pattern.length > 2) throw 'Unexpected array length';
    var gotNodes = w2j.engine_cs.getAll(node, pattern[0]);
    if (pattern.length == 2) {
      return w2j.utils.map(gotNodes, gotNode => { return w2j.engine_cs.getFromPattern(gotNode, pattern[1]); });
    } else {
      return gotNodes;
    }
  case 'string':
    return w2j.engine_cs.getOne(node, pattern);
  default:
    return pattern;
  }
};

// *************************************************************************
// doActions

w2j.engine_cs.EVENT_CONSTRUCTORS_ = {
  'click': MouseEvent,
  'dblclick': MouseEvent,
  'mouseup': MouseEvent,
  'mousedown': MouseEvent,
  'keydown': KeyboardEvent,
  'keypress': KeyboardEvent,
  'keyup': KeyboardEvent,
  'wheel': WheelEvent
};

/**
@param {Element} node
@param {w2j.engine_cs.Action} action
*/
w2j.engine_cs.doAction = function(node, action) {
  switch (action.action) {
    case 'set':
      var elements = node.querySelectorAll(action.selector);
      w2j.utils.forEach(elements, function(element) {
        element.value = action.value;
      });
      break;
    case 'event':
      var eventConstructor = w2j.engine_cs.EVENT_CONSTRUCTORS_[action.type];
      if (eventConstructor) {
        var elements = node.querySelectorAll(action.selector);
        w2j.utils.forEach(elements, function(element) {
          var event = new eventConstructor(action.type, action.init);
          element.dispatchEvent(event);
        });
      }
      break;
  }
};

/**
@param {Element} node
@param {Array.<w2j.engine_cs.Action>} actions
*/
w2j.engine_cs.doActions = function(node, actions) {
  w2j.utils.forEach(actions, w2j.engine_cs.doAction.bind(null, node));
};

// *************************************************************************
// Content script API

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // TODO: Check sender
  switch (request._w2j_) {
    case 'getFromPattern':
      sendResponse({
        result: w2j.engine_cs.getFromPattern(document, request.pattern)
      });
      break;
    case 'doActions':
      w2j.engine_cs.doActions(document, request.actions);
      sendResponse({});
      break;
    default:
  }
});
