var w2j = w2j || {};
w2j.panel = {};

w2j.panel.init = async function($scope) {
  var messageDiv = document.getElementById('message');
  async function updateElementInfo() {
    var response = await w2j.utils.evalScriptInInspectedWindow('devtools/panel_cs.js');
    console.log(response.result);
    $scope.ancestors = response.result;
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
});
