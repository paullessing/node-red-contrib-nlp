#!/usr/bin/env node

const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], autoSave: false, autoLoad: false });

(async () => {
  manager.addDocument('en', 'turn the heating to %number%', 'heating_on');
  manager.addAnswer('en', 'heating_on', 'Turned to %number%');

  await manager.train();

  const result = await manager.process('turn the heating to 24');

  console.log(JSON.stringify(result, 0, 2));
})();
