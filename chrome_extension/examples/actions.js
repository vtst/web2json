var URL = 'https://www.vtst.net/';

async function example() {
  var engine = new W2J.Engine();
  var _ = await engine.get(URL, {});
  engine.doActions([
    {action: 'set', selector: 'input.onebox', value: 'paris'},
    {action: 'event', selector: 'button[value=Google]', type: 'click'}
    ]);
  //await engine.dispose();
};

example();