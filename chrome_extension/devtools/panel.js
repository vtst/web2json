var w2j = w2j || {};
w2j.panel = {};

w2j.panel.init = async function() {
  await w2j.utils.onContentLoaded();
  document.getElementById('message').textContent = 'Hello!';
  chrome.devtools.panels.elements.onSelectionChanged.addListener(async function(event) {
    var response = await w2j.utils.evalScriptInInspectedWindow('devtools/panel_cs.js');
    document.getElementById('message').textContent = response.result.join('\n');
  });
};

w2j.panel.init();
