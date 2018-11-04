var w2j = w2j || {};
w2j.panel = {};

// *************************************************************************
// Utilities for managing ElementInfo

/**
@typedef {
  tagName: string,
  id: string,
  classNames: Array.<string>
}
*/
w2j.panel.ElementInfo;

/** @typedef {selected: boolean, value: string} */
w2j.panel.Selectable;

/**
@typedef {
  tagName: w2j.panel.Selectable,
  id: w2j.panel.Selectable,
  classNames: Array.<w2j.panel.Selectable>
}
*/
w2j.panel.SelectableElementInfo;

/**
@param {string} value
@return {w2j.panel.Selectable}
*/
w2j.panel.getSelectable = function(value) {
  return {
    selected: false,
    value: value
  };
};

/**
@param {w2j.panel.ElementInfo} elementInfo
@return {w2j.panel.SelectableElementInfo}
*/
w2j.panel.getSelectableElementInfo = function(elementInfo) {
  return {
    tagName: w2j.panel.getSelectable(elementInfo.tagName),
    id: w2j.panel.getSelectable(elementInfo.id),
    classNames: w2j.utils.map(elementInfo.classNames, w2j.panel.getSelectable)
  };
};

/**
@param {w2j.panel.SelectableElementInfo}
@return {string}
*/
w2j.panel.formatSelectableAncestorInfo = function(selectableAncestorInfo) {
  var s = '';
  if (selectableAncestorInfo.tagName.selected) s += selectableAncestorInfo.tagName.value;
  if (selectableAncestorInfo.id.selected) s += '#' + selectableAncestorInfo.id.value;
  w2j.utils.forEach(selectableAncestorInfo.classNames, function(className) {
    if (className.selected) s += '.' + className.value;
  });
  return s;
}

/**
@param {Array.<w2j.panel.SelectableElementInfo>}
@return {string}
*/
w2j.panel.formatSelectableAncestorInfos = function(selectableAncestorInfos) {
  return w2j.utils.filter(
    w2j.utils.map(selectableAncestorInfos, w2j.panel.formatSelectableAncestorInfo),
    function(s) { return s; }
    ).join('\n');
}

// *************************************************************************
// Interaction with inspected window

w2j.panel.sendMessage = async function(message) {
  return await chromp.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, message);
};

w2j.panel.getNumberOfMatches = async function(selector) {
  if (!selector) return 0;
  var response = await w2j.panel.sendMessage({
    _w2j_: 'getNumberOfMatches',
    selector: selector
  });
  return response.length;
};

w2j.panel.showMatches = async function(selector) {
  await w2j.panel.sendMessage({
    _w2j_: 'highlight',
    selector: selector
  });
};


// *************************************************************************
// Page interaction

/**
@param {Scope} $scope
*/
w2j.panel.onSelectionChanged = async function($scope) {
  var response = await w2j.utils.evalScriptInInspectedWindow('devtools/panel_eval.js');
  response.result.reverse();
  $scope.selectableAncestorInfos = w2j.utils.map(response.result, w2j.panel.getSelectableElementInfo);
  if ($scope.selectedTab == 0) $scope.selectedTab = 1;
  $scope.$apply();
};

w2j.panel.onNavigated = async function() {
  await chromp.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {file: 'utils.js'});
  await chromp.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {file: 'devtools/panel_cs.js'});    
};

/**
@param {Scope} $scope
*/
w2j.panel.init = async function($scope) {
  // Page navigation
  chrome.devtools.network.onNavigated.addListener(w2j.panel.onNavigated);
  w2j.panel.onNavigated();

  // Element selection
  chrome.devtools.panels.elements.onSelectionChanged.addListener(
    w2j.panel.onSelectionChanged.bind(null, $scope));
  w2j.panel.onSelectionChanged($scope);
};

/**
@param {Scope} $scope
*/
w2j.panel.updateMatches = function($scope) {
  w2j.panel.showMatches($scope.showMatches ? $scope.selector : null);
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

// Here is the problem:
// When loading a new page, $scope.$watch is triggered before the content script is
// initialized. I think it is trigerred because of onSelectionChanged

module.controller('PanelCtrl', function($scope) {
  w2j.panel.init($scope);
  $scope.selectedTab = 0;

  // Watches {{selectableAncestorInfos}} and update {{numberOfMatches}}
  $scope.$watch('selectableAncestorInfos', async function(newValue, oldValue) {
    $scope.selector = w2j.panel.formatSelectableAncestorInfos($scope.selectableAncestorInfos || []);
    $scope.numberOfMatches = await w2j.panel.getNumberOfMatches($scope.selector);
    $scope.$apply();
    w2j.panel.updateMatches($scope);
  }, true);

  // Watches {{showMatches}}
  $scope.$watch('showMatches', async function(newValue, oldValue) {
    w2j.panel.updateMatches($scope);
  });

  $scope.$watch('selectedTab', async function(newValue, oldValue) {
    if ($scope.selectedTab == 0) {
      $scope.showMatches = false;
      $scope.$apply();
    }
  });

  $scope.showTab = function(steps) {
    $scope.selectedTab += steps;
  }
});
