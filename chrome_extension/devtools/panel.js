var w2j = w2j || {};
w2j.panel = {};

w2j.panel.getSelectableElementInfo = function(elementInfo) {
  function getSelectable(value) {
    return {
      selected: false,
      value: value
    };
  }
  return {
    tagName: getSelectable(elementInfo.tagName),
    id: getSelectable(elementInfo.id),
    classNames: w2j.utils.map(elementInfo.classNames, getSelectable)
  };
};

w2j.panel.init = async function($scope) {
  var messageDiv = document.getElementById('message');
  async function updateElementInfo() {
    var response = await w2j.utils.evalScriptInInspectedWindow('devtools/panel_cs.js');
    response.result.reverse();
    $scope.selectableAncestorInfos = w2j.utils.map(response.result, w2j.panel.getSelectableElementInfo);
    $scope.$apply();
  }
  updateElementInfo();
  chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementInfo);
};

// *************************************************************************
// AngularJS app and controller

var module = angular.module('PanelApp', ['ngMaterial', 'ngMessages']);

module.component('w2jSelectorItem', {
  templateUrl: 'selector_item.html',
  bindings: {
    tag: '@',
    selected: '='
  },
  transclude: true,
  controller: function() {
    this.onClick = function() {
      this.selected = !this.selected;
    };
  }
});

module.controller('PanelCtrl', function($scope) {
  w2j.panel.init($scope);
  function formatSelectableAncestorInfo(selectableAncestorInfo) {
    var s = '';
    console.log(selectableAncestorInfo);
    if (selectableAncestorInfo.tagName.selected) s += selectableAncestorInfo.tagName.value;
    if (selectableAncestorInfo.id.selected) s += '#' + selectableAncestorInfo.id.value;
    w2j.utils.forEach(selectableAncestorInfo.classNames, function(className) {
      if (className.selected) s += '.' + className.value;
    });
    if (s) s += '\n';
    return s;
  }
  $scope.formatSelection = function(selectableAncestorInfos) {
    var strings = w2j.utils.map(selectableAncestorInfos || [], formatSelectableAncestorInfo);
    strings.reverse();
    return strings.join('');
  }
});
