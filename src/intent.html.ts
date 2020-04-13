/// <reference path="./types/node-red-ui.d.ts" />

RED.nodes.registerType('intent',{
  category: 'nlp',
  color: '#ffd9f8',
  defaults: {
    name: { value: '' },
    intents: { value: [] },
    noemitnone: { value: false },
  },
  inputs:1,
  outputs:1,
  icon: 'comment.png',
  label: function() {
    return this.name||'intent';
  },
  oneditprepare: function() {
    // $('#node-input-payload').typedInput({
    //   default: 'str',
    //   typeField: $('#node-input-payloadType'),
    //   types:['str']
    // });

    $('#intents-container').css('min-height','150px').css('min-width','450px').editableList({
      // @ts-ignore
      addItem: (container, i: number, opt) => {
        const wrapper = $(
          `<div style="display: flex; flex-direction: column; margin: 5px 0">
              <label style="display: flex; width: 100%">
                <span style="flex: 0 0 auto">
                  <i class="fa fa-lightbulb-o" style="margin-right: 5px;"></i>
                  Intent:
                </span>
                <input
                  type="text"
                  style="margin-left: 5px; width: 100%; border-radius: 0; border-width: 0 0 1px 0; padding: 0 0 2px 0; margin-bottom: 5px; height: auto; font-family: monospace"
                  placeholder="Intent ID"
                  data-key="intent"
                >
              </label>
              <textarea
                placeholder="Utterances (one per line)"
                style="width: 100%"
                data-key="utterances"
              ></textarea>
            </div>`);
        wrapper.appendTo(container);

        if (opt.hasOwnProperty('intent')) {
          const { utterances, intent } = opt.intent;
          wrapper.find('[data-key=utterances]').val(utterances.join('\n'));
          wrapper.find('[data-key=intent]').val(intent);
        }

        const $utteranceContainer = wrapper.find('[data-key=utterances]');
        $utteranceContainer.css('overflow', 'hidden');

        $utteranceContainer.height(Math.max($utteranceContainer[0].scrollHeight - 10, 74)); // 74 = 3 lines
        $utteranceContainer.on('keyup', function () {
          $(this).height(16);
          $(this).height(Math.max(this.scrollHeight - 10, 74))
        })
      },
      // removeItem: function(opt) {
      //   console.log('Remove', arguments);
      // },
      // resizeItem: resizeRule,
      // sortItems: function(rules) {
      //   var currentOutputs = JSON.parse(outputCount.val()||'{}');
      //   var rules = $('#node-input-rule-container').editableList('items');
      //   rules.each(function(i) {
      //     $(this).find('.node-input-rule-index').html(i+1);
      //     var data = $(this).data('data');
      //     currentOutputs[data.hasOwnProperty('i')?data.i:data._i] = i;
      //   });
      //   outputCount.val(JSON.stringify(currentOutputs));
      // },
      sortable: true,
      removable: true
    });

    let intents: { intent: string, utterances: string[] }[] = this.intents;
    if (typeof this.intents === 'string') {
      try {
        intents = JSON.parse(this.intents);
      } catch (e) {}
    }

    const defaultValue = { utterances: [], intent: '' };
    if (!intents || !intents.length) {
      intents = [defaultValue];
    }
    intents.forEach((intent) => {
      $('#intents-container').editableList('addItem',{ intent });
    });
  },
  oneditsave: function() {
    // console.log('Saving');
    const intentList = $('#intents-container').editableList('items');
    const intents: { intent: string, utterances: string[] }[] = [];
    intentList.each(function (this: HTMLElement) {
      const utterances = ($(this).find('[data-key=utterances]').val() as string)
        .split('\n')
        .filter(x => x.trim());
      const intent = ($(this).find('[data-key=intent]').val() as string);
      intents.push({
        intent, utterances
      });
    });
    // console.log('Utterances', utterances);
    $('#node-input-intents').val(JSON.stringify(intents));
  },
  oneditresize: function(size) {
    const rows = $('#dialog-form > *:not(.node-intents-container-row)');
    let height = size.height;
    for (let i = 0; i < rows.length; i++) {
      height -= $(rows[i]).outerHeight(true)!;
    }
    const editorRow = $('#dialog-form > .node-intents-container-row');
    height -= (parseInt(editorRow.css('marginTop'), 10) + parseInt(editorRow.css('marginBottom'), 10));
    height += 16;

    $('#intents-container').editableList('height',height);
  }
});
