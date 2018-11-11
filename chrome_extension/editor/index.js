var module = angular.module('EditorApp', ['ngMaterial', 'ngMessages', 'ui.codemirror']);

function initCodeMirror(textArea) {
  var timeout = {};
  timeout.id = window.setInterval(function() {
    if (!textArea.classList.contains('ng-cloak')) {
      window.clearInterval(timeout.id);
      CodeMirror.fromTextArea(textArea, {
        lineNumbers: true
      });
    }
  }, 10);
}

module.controller('EditorCtrl', function($scope) {
  var textArea = document.getElementById('editor');
  initCodeMirror(textArea);
});
