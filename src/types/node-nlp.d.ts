declare module 'node-nlp' {
  type TODO = unknown;

  /* Public Interface
    Language,
    NlpUtil,
    NlpManager,
    NlpExcelReader,
    XTableUtils,
    XTable,
    XDoc,
    removeEmojis,
    Evaluator,
    SpellCheck,
    Handlebars,
    ActionManager,
    NlgManager,
    NeuralNetwork,
    SentimentAnalyzer,
    SentimentManager,
    Recognizer,
    ConversationContext,
    MemoryConversationContext,
  */


  export type EntityType = 'date' | 'datetime' | 'number' | 'currency' | 'phonenumber' | string; // TODO find out others

  export type IntentId = string | 'None';
  export type Score = number; // Between 0 and 1
  export type Locale = string; // e.g. "en"

  interface NlpConstructorSettings {
    languages?: string | string[];
    locales?: string | string[];
    corpora?: TODO;
    autoLoad?: boolean;
    autoSave?: boolean;
    modelFileName?: string;
    threshold?: Score;

    tag?: string;
    ner?: NerConstructorSettings;
    nlu?: {
      [locale: string]: {
        [domain: string]: TODO & {
          className: string;
        };
      };
    };
    nlg?: TODO;
    action?: TODO;
    sentiment?: TODO;
    slot?: TODO;
  }

  interface NerConstructorSettings {
    ducklingUrl?: string;
    useDuckling?: boolean;
    [key: string]: TODO;
  }

  export class NlpManager {
    constructor(settings: NlpConstructorSettings & {
      container?: TODO;
      ner?: NerConstructorSettings;
    });

    public addDocument(locale: Locale, utterance: string, id: IntentId): void;
    public addAnswer(locale: Locale, id: IntentId, response: string): void;

    public train(): Promise<unknown>;
    public save(): void;

    public process(sourceInput: NlpManager.SourceInput): Promise<ProcessedUtterance>;
    public process(utterance: string): Promise<ProcessedUtterance>;
    public process(locale: Locale, utterance: string): Promise<ProcessedUtterance>;
  }

  export namespace NlpManager {
    export type SourceInput = (
      { utterance: string } |
      { message: string }
    ) & {
      locale?: string,
      channel?: any,
      app?: any
    };
  }

  export interface ProcessedUtterance {
    utterance: string;
    locale: Locale; // e.g. "en"
    languageGuessed: boolean;
    localeIso2: string; // e.g. "en"
    language: string; // e.g. "English"
    domain?: string; // TODO does this exist?
    nluAnswer?: {
      classifications: Classification[];
    };
    classifications: Classification[];
    intent: IntentId;
    score: Score;
    optionalUtterance?: string; // E.g. "Hello %datetime%"
    sourceEntities: SourceEntity[];
    entities: ProcessedEntity[]; // TODO can this be null?
    sentiment: Sentiment;
    actions: unknown[];
    // srcAnswer: string;
    answer: string; // Likely same as srcAnswer but maybe something interpolated?
    answers: { answer: string }[];
  }

  export interface Classification {
    intent: string | 'None';
    score: Score;
  }

  export type ProcessedEntity = {
    start: number;
    end: number;
    len: number;
    accuracy: Score;
    sourceText: string; // e.g. "now"
    utteranceText: string; // e.g. "now"
  } & Resolution;

  export type Resolution =
      EmailResolution
    | IpResolution
    | HashtagResolution
    | PhoneResolution
    | UrlResolution
    | NumberResolution
    | OrdinalResolution
    | PercentageResolution
    | DimensionResolution
    | AgeResolution
    | CurrencyResolution
    | DateResolution
    | DateTimeResolution
    | DurationResolution
    | TemperatureResolution;

  export interface NumberResolution {
    entity: 'number';
    resolution: {
      strValue: string;
      value: number;
      subtype: 'integer' | 'float' | string;
    };
  }

  export interface DateTimeResolution {
    entity: 'datetime';
    resolution: {
      // If the time is ambiguous, you may get multiple values
      values: {
        timex: string;
        type: 'datetime';
        value: string; // e.g. "2020-01-01 00:00:00"
      }[];
    };
  }

  export interface DateResolution {
    entity: 'date';
    resolution: {
      type: 'date';
      timex: string;
      strValue: string;
      date: string; // e.g. "2020-01-01T00:00:00.000Z"
    } | {
      type: 'interval';
      timex: string; // e.g. "XXXX-04-15"
      strPastValue: string; // e.g. "2020-04-15",
      pastDate: string; // e.g. "2020-04-15T00:00:00.000Z",
      strFutureValue: string; // e.g. "2021-04-15",
      futureDate: string; // e.g. "2021-04-15T00:00:00.000Z"
    };
  }

  export interface CurrencyResolution {
    entity: 'currency';
    resolution: {
      strValue: string;
      value: number;
      unit: string; // e.g. "Pound"
      localeUnit: string; // e.g. "Pound"
    };
  }

  export interface PhoneResolution {
    entity: 'phonenumber';
    resolution: {
      value: string;
      score: string; // e.g. "0.6"
    };
  }

  export interface EmailResolution {
    entity: 'email';
    resolution: {
      value: string;
    };
  }

  export interface HashtagResolution {
    entity: 'hashtag';
    resolution: {
      value: string;
    };
  }

  export interface UrlResolution {
    entity: 'url';
    resolution: {
      value: string;
    };
  }

  export interface DurationResolution {
    entity: 'duration';
    resolution: {
      values: [{
        timex: string; // e.g. 'PT24M'
        type: 'duration';
        value: string; // Numeric string representing seconds e.g. "1440"
      }];
    }
  }

  export interface AgeResolution {
    entity: 'age';
    resolution: {
      strValue: string;
      value: number;
      unit: string; // e.g. "Year"
      localeUnit: string; // e.g. "Ans"
    };
  }

  export interface IpResolution {
    entity: 'ip';
    resolution: {
      value: string; // e.g. "127.0.0.1"
      type: 'ipv4' | 'ipv6';
    }
  }

  export interface DimensionResolution {
    entity: 'dimension';
    resolution: {
      strValue: string;
      value: number;
      unit: string; // e.g. "Meter"
      localeUnit: string;
    }
  }

  export interface OrdinalResolution { // 1st, 2nd, fifth
    entity: 'ordinal';
    resolution: {
      strValue: string;
      value: number;
      subtype: 'integer' | string;
    }
  }

  export interface PercentageResolution {
    entity: 'percentage';
    resolution: {
      strValue: string;
      value: number;
      subtype: 'integer' | 'float' | string;
    }
  }

  export interface TemperatureResolution {
    entity: 'temperature';
    resolution: {
      strValue: string;
      value: number;
      unit: 'K' | 'C' | 'F' | 'R';
      localeUnit: 'K' | 'C' | 'F' | 'R';
    }
  }

  export interface SourceEntity {
    start: number; // position in the string
    end: number; // position in the string
    resolution: {
      value: string;
      unit?: string; // age
      srcUnit?: string; // age
    }
    text: string;
    typeName: 'number' | 'ordinal' | 'percentage' | 'age' | 'currency' | 'dimension' | 'datetimeV2.date' | 'phonenumber' | 'ip' | 'email' | 'hashtag' | 'url';
  }

  export type SourceResolution = {
    value: string;
  } | { // age, dimension, email, hashtag, url
    value: string | null;
    unit: string;
    srcUnit: string;
  } | { // currency
    value: string;
    unit: string; // British pound
    isoCurrency: string; // GBP
    srcUnit: string; // British pound
  } | { // datetimeV2.date
    values: [{
      timex: string;
      type: 'date';
      value: string; // ISO date YYYY-MM-DD
    }];
  } | { // phonenumber
    value: string;
    score: string; // probably 0 to 1
  } | { // ip
    value: string;
    type: 'ipv4' | 'ipv6';
  }

  export interface Sentiment {
    score: Score;
    numWords: number;
    numHits: number;
    average: number;
    vote: 'positive' | 'neutral' | 'negative';
    type: 'senticon' | string; // TODO others?
    locale: Locale;
  }
}
