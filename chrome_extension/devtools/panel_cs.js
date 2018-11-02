var w2j = w2j || {};
w2j.panel_cs = {};

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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request._w2j_) {
    case 'getNumberOfMatches':
      var elements = request.selector ? document.querySelectorAll(request.selector) : [];
      sendResponse({length: elements.length});
      break;
    case 'highlight':
      var elements = request.selector ? document.querySelectorAll(request.selector) : [];
      w2j.utils.forEach(elements, function(element) {
        var offset = w2j.panel_cs.getElementOffset(element);
        var div = document.createElement('div');
        div.style.background = 'rgba(255, 0, 0, .5)';
        div.style.position = 'absolute';
        div.style.top = offset.top + 'px';
        div.style.left = offset.left + 'px';
        div.style.width = element.offsetWidth + 'px';
        div.style.height = element.offsetHeight + 'px';
        div.style.zIndex = '10000';
        document.body.appendChild(div);
      });
      sendResponse({});
      break;
    default:
  }
});
