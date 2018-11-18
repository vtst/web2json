var w2j = w2j || {};
w2j.editor = {};

var module = angular.module('EditorApp', ['ngMaterial', 'ngMessages']);

module.controller('EditorCtrl', function($scope) {
});

w2j.editor.initCodeMirror = function(element, options) {
  var observer = new MutationObserver(function(mutations, observer) {
    w2j.utils.forEach(mutations, function(mutation) {
      if (mutation.attributeName == 'class' &&
        mutation.oldValue && mutation.oldValue.includes('ng-cloak') && !mutation.target.classList.contains('ng-cloak')) {
        window.setTimeout(function() {
          CodeMirror.fromTextArea(element, options);
        }, 0);
        observer.disconnect();
      }
    });
  });
  observer.observe(document.body, {
    subtree: false,
    attributes: true,
    attributeOldValue: true
  });
};

module.directive("w2jCodemirror", function () {
  return {
    restring: 'A',
    compile: function(elements, attrs) {
      w2j.editor.initCodeMirror(elements[0], {
        lineNumbers: true,
        viewportMargin: Infinity
      });
    },
    bindToController: true,
    controller: function($element, $timeout) {
      $timeout(function() {
      }, 1000);
      this.$postLink = function() {
      }
    }
  };
});