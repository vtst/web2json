chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request._w2j_) {
    case 'querySelectorAll':
      var elements = document.querySelectorAll(request.selector);
      sendResponse({
        numberOfElements: elements.length
      });
      break;
    default:
  }
});
