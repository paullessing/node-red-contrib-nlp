/// <reference types="jquery" />

interface ConfigObject<T> {
  category: string;
  color: string;
  defaults: {
    [prop in keyof T]: { value: T[prop] }
  };
  inputs: number;
  outputs: number;
  icon: string;
  label(this: T): string;
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
