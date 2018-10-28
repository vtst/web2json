// Background page for the extension.

var w2j = w2j || {};
w2j.bg = {};

// *************************************************************************
// Executing scripts

/**
@param {string} script
*/
w2j.bg.executeScript = async function(script) {
  var GLOBAL_SCOPE = {
    W2J: {
      Engine: w2j.Engine,
      utils: w2j.utils
    },
    console: console
  }
  localeval(script, GLOBAL_SCOPE);
};

// *************************************************************************
// Context menus

chrome.contextMenus.create({
  id: 'w2j-extract',
  title: 'Extract Web to JSON'
});

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
  if (info.menuItemId == 'w2j-extract') {
    var script = await w2j.utils.getFileContentFromPackage('examples/actions.js');
    await w2j.bg.executeScript(script);
  }
});
