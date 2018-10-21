var URL = 'https://www.google.com/';

async function example() {
  var engine = new W2J.Engine();
  var _ = await engine.get(URL, {});
  await engine.doActions([
    {type: 'set', selector: 'input.gsfi', value: 'paris'}
    ]);
  //await engine.dispose();
};

example();