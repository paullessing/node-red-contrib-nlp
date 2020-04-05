import { Red, Node, NodeProperties } from './types/node-red';
import { NlpManager } from 'node-nlp';

export = function register(RED: Red) {
  RED.nodes.registerType('intent', IntentNode);

  const manager = new NlpManager({ languages: ['en'], autoLoad: false });
  // Adds the utterances and intents for the NLP
  manager.addDocument('en', 'turn the heating to %temperature%', 'heating_on');
  manager.addDocument('en', 'turn on the heating', 'heating_on');
  manager.addDocument('en', 'turn the heating on', 'heating_on');
  manager.addDocument('en', 'switch on the heating', 'heating_on');
  manager.addDocument('en', 'heating on', 'heating_on');
  manager.addDocument('en', 'warm up', 'heating_on');
  manager.addDocument('en', 'set heating to %temperature%', 'heating_on');
  manager.addDocument('en', 'heat to %temperature%', 'heating_on');
  manager.addDocument('en', 'start heating', 'heating_on');
  manager.addDocument('en', 'turn off the heating', 'heating_off');
  manager.addDocument('en', 'switch off the heating', 'heating_off');
  manager.addDocument('en', 'switch heating off', 'heating_off');
  manager.addDocument('en', 'heating off', 'heating_off');
  manager.addDocument('en', 'stop heating', 'heating_off');
  manager.addDocument('en', 'boost heating', 'heating_boost');
  manager.addDocument('en', 'boost heating for %duration%', 'heating_boost');
  manager.addDocument('en', 'boost heating to %temperature% for %duration%', 'heating_boost');
  manager.addDocument('en', 'heating boost 90m', 'heating_boost');
  manager.addDocument('en', 'boost the heating', 'heating_boost');

  // Train also the NLG
  manager.addAnswer('en', 'heating_on', 'Heating set to %temperature%');
  manager.addAnswer('en', 'heating_on', 'Heating turned on');

  // Train and save the model.
  const trained = manager.train();

  function IntentNode(this: Node, config: NodeProperties) {
    RED.nodes.createNode(this, config);

    this.on('input', async (msg: any, send, done) => {
      console.log('INPUT EVENT', msg, config);

      await trained;

      if (typeof msg.payload !== 'string') {
        throw new Error('Expected payload to be string, was ' + JSON.stringify(msg.payload));
      }

      const result = await manager.process(msg.payload);

      send({
        topic: msg.topic,
        payload: result.answer,
        intent: result
      });
      done();
    });
  }
}
