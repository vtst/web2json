var w2j = w2j || {};
w2j.panel = {};

/**
@param {w2j.panel.ElementInfo}
@return {string}
*/
w2j.panel.formatElementInfo = function(elementInfo) {
  var s = elementInfo.tagName;
  if (elementInfo.id) s += '#' + elementInfo.id;
  w2j.utils.forEach(elementInfo.classNames, className => {
    s += '.' + className;
  });
  return s;
};

w2j.panel.init = async function() {
  await w2j.utils.onContentLoaded();
  var messageDiv = document.getElementById('message');
  async function updateElementInfo() {
    var response = await w2j.utils.evalScriptInInspectedWindow('devtools/panel_cs.js');
    messageDiv.textContent = 
      w2j.utils.map(response.result, w2j.panel.formatElementInfo).join('\n');
  }
  updateElementInfo();
  chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementInfo);
};

w2j.panel.init();
