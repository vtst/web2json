// Background page for the extension.

var w2j = w2j || {};
w2j.bg = {};

// *************************************************************************
// Demo

w2j.bg.URL = 'https://www.google.com/search?q=vincent+simonet';

w2j.bg.OBJECT1 = {
  'title': 'head title/textContent',
  'hrefs': ['a/[href]'],
  'links': ['a', {
    'href': '/[href]',
    'text': '/textContent'
  }]
};

w2j.bg.OBJECT2 = {
  results: ['div.rc h3.r a', {
    href: '/[href]',
    text: '/textContent'
  }],
  next: {
    href: 'a.pn/[href]',
    text: 'a.pn/textContent'
  }
};

// *************************************************************************
// Context menus

chrome.contextMenus.create({
  id: 'w2j-extract',
  title: 'Extract Web to JSON'
});

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
  if (info.menuItemId == 'w2j-extract') {
    var engine = new w2j.Engine(tab);
    var mappedObj = await engine.get(w2j.bg.URL, w2j.bg.OBJECT2);
    console.log(mappedObj);
  }
});
