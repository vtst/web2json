// Background page for the extension.

var w2j = w2j || {};
w2j.bg = {};

// *************************************************************************
// Main functions

// *************************************************************************
// Context menus

chrome.contextMenus.create({
  id: 'w2j-extract',
  title: 'Extract Web to JSON'
});

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
  if (info.menuItemId == 'w2j-extract') {
    var obj = {
      results: W2J.getAll('div.rc h3.r', {
        href: W2J.get('a/[href]'),
        text: W2J.get('a/textContent')
      }),
      next: W2J.get('a.pn', {
        href: W2J.get('/[href]'),
        text: W2J.get('/textContent')
      })
    }
    var mappedObj = await w2j.bg.get(tab, 'https://www.google.com/search?q=vincent+simonet', obj);
    console.log(mappedObj);
  }
});

function foo() {
  var test = async W2J.get({
    'title': W2J.$one('head title/textContent'),
    'hrefs': W2J.$all('a/[href]']),
    'links': W2J.$all('a', {
    });
  });

  var test = async W2J.get({
    'title': 'head title/textContent',
    'hrefs': ['a/[href]'],
    'links': ['a', {
      'href': '/[href]',
      'text': '/textContent'
    }]
  })
}