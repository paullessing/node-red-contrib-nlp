declare module 'node-nlp' {
  type TODO = unknown;

  export type EntityType = 'date' | 'datetime' | 'number' | 'currency' | 'phonenumber' | string; // TODO find out others

  export type IntentId = string | 'None';
  export type Score = number; // Between 0 and 1
  export type Locale = string; // e.g. "en"

  export class NlpManager {
    constructor(config: {
      languages: string[];
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
    sourceEntities: unknown[];
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

  export type Resolution = NumberResolution
    | DateTimeResolution
    | DateResolution
    | CurrencyResolution
    | PhonenumberResolution
    | EmailResolution
    | HashtagResolution
    | UrlResolution;

  export interface NumberResolution {
    entity: 'number';
    resolution: {
      strValue: string;
      value: number;
      subtype: 'integer' | string;
    };
  }

  export interface DateTimeResolution {
    entity: 'datetime';
    resolution: {
      values: [{
        timex: string;
        type: 'datetime';
        value: string; // e.g. "2020-01-01 00:00:00"
      }];
    };
  }

  export interface DateResolution {
    entity: 'date';
    resolution: {
      type: 'date';
      timex: string;
      strValue: string;
      date: string; // e.g. "2020-01-01T00:00:00.000Z"
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

  export interface PhonenumberResolution {
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
