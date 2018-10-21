var URL = 'https://www.google.com/';

async function example() {
  var engine = new W2J.Engine();
  var _ = await engine.get(URL, {});
  engine.doActions([
    {action: 'set', selector: 'input.gsfi', value: 'paris'},
    {action: 'event', selector: 'input[name=btnI]', type: 'click'}
    ]);
  //await engine.dispose();
};

example();