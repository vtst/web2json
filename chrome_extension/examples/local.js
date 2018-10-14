var URL = 'file:///home/vtst/test/index.html';

var PATTERN = {
  results: ['div.rc h3.r a', {
    href: '/[href]',
    text: '/textContent'
  }],
  next: {
    href: 'a.pn/[href]',
    text: 'a.pn/textContent'
  }
};

async function example() {
  var engine = new W2J.Engine();
  var mappedObj = await engine.getPagined({
    url: URL,
    nextPageSelector: 'a#pnnext/[href]',
    maxPages: 3
  }, PATTERN);
  console.log(mappedObj);
  var list = await engine.get(W2J.utils.map(mappedObj[0].results, function(result) {
    return W2J.utils.relativeUrl(result.href, URL);
  }), {
    title: 'title/textContent',
    div: 'div/textContent'
  });
  console.log(list);
  await engine.dispose();
};

example();