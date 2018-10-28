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
  var messageDiv = document.getElementById('message');
  async function updateElementInfo() {
    console.log('update');
    var response = await w2j.utils.evalScriptInInspectedWindow('devtools/panel_cs.js');
    messageDiv.textContent = 
      w2j.utils.map(response.result, w2j.panel.formatElementInfo).join('\n');
  }
  updateElementInfo();
  chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementInfo);
};

// *************************************************************************
// AngularJS app and controller

var module = angular.module('PanelApp', ['ngMaterial', 'ngMessages']);

module.controller('PanelCtrl', function($scope) {
  w2j.panel.init();
});

