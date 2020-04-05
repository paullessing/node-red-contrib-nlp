import { Red, Node, NodeProperties } from './types/node-red';
import { NlpManager } from 'node-nlp';

interface UtteranceConfig {
  utterance: string;
  intent: string;
}

export = function register(RED: Red) {
  RED.nodes.registerType('intent', IntentNode);

  // // Adds the utterances and intents for the NLP
  // manager.addDocument('en', 'turn the heating to %temperature%', 'heating_on');
  // manager.addDocument('en', 'turn on the heating', 'heating_on');
  // manager.addDocument('en', 'turn the heating on', 'heating_on');
  // manager.addDocument('en', 'switch on the heating', 'heating_on');
  // manager.addDocument('en', 'heating on', 'heating_on');
  // manager.addDocument('en', 'warm up', 'heating_on');
  // manager.addDocument('en', 'set heating to %temperature%', 'heating_on');
  // manager.addDocument('en', 'heat to %temperature%', 'heating_on');
  // manager.addDocument('en', 'start heating', 'heating_on');
  // manager.addDocument('en', 'turn off the heating', 'heating_off');
  // manager.addDocument('en', 'switch off the heating', 'heating_off');
  // manager.addDocument('en', 'switch heating off', 'heating_off');
  // manager.addDocument('en', 'heating off', 'heating_off');
  // manager.addDocument('en', 'stop heating', 'heating_off');
  // manager.addDocument('en', 'boost heating', 'heating_boost');
  // manager.addDocument('en', 'boost heating for %duration%', 'heating_boost');
  // manager.addDocument('en', 'boost heating to %temperature% for %duration%', 'heating_boost');
  // manager.addDocument('en', 'heating boost 90m', 'heating_boost');
  // manager.addDocument('en', 'boost the heating', 'heating_boost');
  //
  // // Train also the NLG
  // manager.addAnswer('en', 'heating_on', 'Heating set to %temperature%');
  // manager.addAnswer('en', 'heating_on', 'Heating turned on');

  // Train and save the model.
  function IntentNode(this: Node, config: NodeProperties) {
    RED.nodes.createNode(this, config);
    const node: Node = this as any;

    const manager = new NlpManager({ languages: ['en'], autoSave: false, autoLoad: false });

    const utterances = parseUtterances(config.utterances);
    utterances.forEach(({ utterance, intent }) => {
      manager.addDocument('en', utterance, intent);
    });
    const trained = manager.train();
    trained.then(() => {
      node.status({
        fill: 'blue',
        shape: 'dot',
        text: `${utterances.length} utterances`
      });
    });


    node.on('input', async (msg: any, send, done) => {
      // console.log('INPUT EVENT', msg, config);

      await trained;

      if (typeof msg.payload !== 'string') {
        throw new Error('Expected payload to be string, was ' + JSON.stringify(msg.payload));
      }

      const result = await manager.process(msg.payload);

      send({
        ...msg,
        payload: result.intent,
        parseResult: result
      });
      done();
    });

    function parseUtterances(configUtterances: string | UtteranceConfig[]): UtteranceConfig[] {
      try {
        const parsed: UtteranceConfig[] = typeof configUtterances === 'string' ?
          JSON.parse(configUtterances) :
          configUtterances;
        return parsed.filter(({ utterance, intent }) => utterance && intent);
      } catch (e) {
        return [];
      }
    };
  }
}
