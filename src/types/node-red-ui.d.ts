/// <reference types="jquery" />

interface ConfigObject<T> {
  category: string;
  color: string;
  defaults: {
    [prop in keyof T]: {
      value: T[prop];
      required?: boolean;
      validate?: (this: T, value: T[prop]) => boolean;
      type?: string;
    }
  };
  inputs: number;
  outputs: number;
  icon: string;
  label(this: T): string;
  outputLabels(this: T, index: number): string | null;
  oneditprepare(this: T): void;
  oneditsave(this: T): void;
  oneditresize(this: T, size: { height: number, width: number }): void;
}

declare const RED: {
  nodes: {
    registerType<T>(type: 'intent', config: ConfigObject<T>): void;
  }
};

interface JQuery {
  editableList: any;
}
