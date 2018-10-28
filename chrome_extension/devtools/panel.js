var w2j = w2j || {};
w2j.panel = {};

w2j.panel.init = async function() {
  await w2j.utils.onContentLoaded();
  document.getElementById('message').textContent = 'Hello!';
  chrome.devtools.panels.elements.onSelectionChanged.addListener(async function(event) {
    var response = await chromp.devtools.inspectedWindow.eval("$0.textContent");
    document.getElementById('message').textContent = response.result;
  });
};

w2j.panel.init();
