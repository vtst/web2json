var w2j = w2j || {};
w2j.panel_cs = {};

// *************************************************************************
// Highlighting

/**
@param {Element} el
@return {{top: number, left: number}}
*/
w2j.panel_cs.getElementOffset = function(el) {
  var rect = el.getBoundingClientRect(),
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
};

/**
@return {number}
*/
w2j.panel_cs.getMaximumZIndex = function() {
  var elements = document.getElementsByTagName('*');
  var result = 0;
  w2j.utils.forEach(elements, function(element) {
    var zIndex = document.defaultView.getComputedStyle(element, null).getPropertyValue('z-index');
    if (zIndex > result && zIndex != 'auto') result = zIndex;
  });
  return result;
};

/**
@param {Array.<Element>} elements
*/
w2j.panel_cs.highlightElements = function(elements) {
  // Remove existing overlays
  var overlays = document.getElementsByClassName('w2j-overlay');
  while (overlays.length > 0) {
    document.body.removeChild(overlays[0]);    
  }
  // Add new overlays
  var zIndex = w2j.panel_cs.getMaximumZIndex() + 1;
  w2j.utils.forEach(elements, function(element) {
    var offset = w2j.panel_cs.getElementOffset(element);
    var div = document.createElement('div');
    div.className = 'w2j-overlay'
    div.style.background = 'rgba(255, 0, 0, .5)';
    div.style.position = 'absolute';
    div.style.top = offset.top + 'px';
    div.style.left = offset.left + 'px';
    div.style.width = element.offsetWidth + 'px';
    div.style.height = element.offsetHeight + 'px';
    div.style.zIndex = zIndex;
    document.body.appendChild(div);
  });
};

// *************************************************************************
// Message listener

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request._w2j_) {
    case 'getNumberOfMatches':
      var elements = request.selector ? document.querySelectorAll(request.selector) : [];
      sendResponse({length: elements.length});
      break;
    case 'highlight':
      var elements = request.selector ? document.querySelectorAll(request.selector) : [];
      w2j.panel_cs.highlightElements(elements);
      sendResponse({});
      break;
    default:
  }
});
