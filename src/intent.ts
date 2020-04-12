import { Red, Node, NodeProperties } from './types/node-red';
import { NlpManager } from 'node-nlp';

interface IntentConfig {
  utterances: string[];
  intent: string;
}

// TODO add a config setting for "emit only on match"

export = function register(RED: Red) {
  RED.nodes.registerType('intent', IntentNode);

  // Train and save the model.
  function IntentNode(this: Node, config: NodeProperties) {
    RED.nodes.createNode(this, config);
    const node: Node = this as any;

    const manager = new NlpManager({ languages: ['en'], autoSave: false, autoLoad: false });

    console.log(config);

    const utterances = parseUtterances(config.intents);
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
        payload: {
          intent: result.intent,
          answer: result.answer,
        },
        parseResult: result
      });
      done();
    });

    function parseUtterances(configUtterances: string | IntentConfig[]): { utterance: string, intent: string }[] {
      try {
        const parsed: IntentConfig[] = typeof configUtterances === 'string' ?
          JSON.parse(configUtterances) :
          configUtterances;
        const utterances: { utterance: string, intent: string }[] = [];
        parsed.forEach(({ utterances: _utterances, intent }) => {
          if (_utterances && _utterances.length && intent) {
            _utterances.forEach((utterance) => {
              utterances.push({ intent, utterance });
            })
          }
        });
        return utterances;
      } catch (e) {
        return [];
      }
    }
  }
}
