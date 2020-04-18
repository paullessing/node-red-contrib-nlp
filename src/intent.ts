import { Red, Node, NodeProperties } from './types/node-red';
import { NlpManager } from 'node-nlp';

interface IntentConfig {
  utterances: string[];
  intent: string;
}

export = function register(RED: Red) {
  RED.nodes.registerType('intent', IntentNode);

  // Train and save the model.
  function IntentNode(this: Node, config: NodeProperties) {
    RED.nodes.createNode(this, config);
    const node: Node = this as any;

    const manager = new NlpManager({ languages: ['en'], autoSave: false, autoLoad: false });

    // console.log(config);

    const parsedIntents = parseIntents(config.intents);
    const intentNames = ['None'].concat(parsedIntents
      .filter(({ utterances, intent }) => intent.trim() && utterances.filter((utterance) => utterance.trim()).length)
      .map(({ intent }) => intent));

    function createOutput<T>(intentName: string, output: T): (T | null)[] {
      const outArray: (T | null)[] = [];
      for (let i = 0; i < intentNames.length; i++) {
        outArray.push(intentNames[i] === intentName ? output : null);
      }
      return outArray;
    }

    const utterances = parseUtterances(parsedIntents);
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

      if (result.intent !== 'None' || !config.noemitnone) {
        send(createOutput(result.intent, {
          ...msg,
          payload: {
            intent: result.intent,
            // answer: result.answer,
          },
          parseResult: result
        }));
      } else {
        send(null);
      }

      done && done();
    });

    function parseIntents(intentConfig: IntentConfig[] | string): IntentConfig[] {
      try {
        if (typeof intentConfig === 'string') {
          return JSON.parse(intentConfig) || [];
        } else {
          return intentConfig;
        }
      } catch (e) {
        return [];
      }
    }

    function parseUtterances(configUtterances: IntentConfig[]): { utterance: string, intent: string }[] {
      const utterances: { utterance: string, intent: string }[] = [];
      configUtterances.forEach(({ utterances: _utterances, intent }) => {
        if (_utterances && _utterances.length && intent) {
          _utterances.forEach((utterance) => {
            utterances.push({ intent, utterance });
          })
        }
      });
      return utterances;
    }
  }
}
