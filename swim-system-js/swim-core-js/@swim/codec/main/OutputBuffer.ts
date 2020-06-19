// Copyright 2015-2020 Swim inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Format} from "./Format";
import {OutputException} from "./OutputException";
import {Output} from "./Output";

/**
 * Non-blocking token stream buffer.
 */
export abstract class OutputBuffer<T = unknown> extends Output<T> {
  abstract isPart(): boolean;
  abstract isPart(isPart: boolean): OutputBuffer<T>;

  abstract index(): number;
  abstract index(index: number): OutputBuffer<T>;

  abstract limit(): number;
  abstract limit(limit: number): OutputBuffer<T>;

  abstract capacity(): number;

  abstract remaining(): number;

  abstract has(index: number): boolean;

  abstract get(index: number): number;

  abstract set(index: number, token: number): void;

  abstract write(token: number): OutputBuffer<T>;
  abstract write(string: string): OutputBuffer<T>;

  writeln(string?: string): OutputBuffer<T> {
    if (typeof string === "string") {
      this.write(string);
    }
    return this.write(this.settings().lineSeparator());
  }

  display(object: unknown): OutputBuffer<T> {
    Format.display(object, this);
    return this;
  }

  debug(object: unknown): OutputBuffer<T> {
    Format.debug(object, this);
    return this;
  }

  abstract step(offset?: number): OutputBuffer<T>;

  flush(): OutputBuffer<T> {
    return this;
  }

  abstract settings(): OutputSettings;
  abstract settings(settings: AnyOutputSettings): Output<T>;

  clone(): OutputBuffer<T> {
    throw new Error();
  }

  private static _fullBuffer?: OutputBuffer<any>;

  private static _doneBuffer?: OutputBuffer<any>;

  /**
   * Returns an `OutputBuffer` in the _full_ state, that binds a `null` result.
   */
  static full<T>(value: T | null = null, settings: OutputSettings = OutputSettings.standard()): OutputBuffer<T> {
    if (value === null && settings === OutputSettings.standard()) {
      if (OutputBuffer._fullBuffer === void 0) {
        OutputBuffer._fullBuffer = new OutputBufferFull(value, OutputSettings.standard());
      }
      return OutputBuffer._fullBuffer;
    }
    return new OutputBufferFull<T>(value!, settings);

  }

  /**
   * Returns an `OutputBuffer` in the _done_ state, that binds a `null` result.
   */
  static done<T>(value: T | null = null, settings: OutputSettings = OutputSettings.standard()): OutputBuffer<T> {
    if (value === null && settings === OutputSettings.standard()) {
      if (OutputBuffer._doneBuffer === void 0) {
        OutputBuffer._doneBuffer = new OutputBufferDone(value, OutputSettings.standard());
      }
      return OutputBuffer._doneBuffer;
    }
    return new OutputBufferDone<T>(value!, settings);
  }

  /**
   * Returns an `OutputBuffer` in the _error_ state, with the given output `error`.
   */
  static error<T>(error: Error, settings: OutputSettings = OutputSettings.standard()): OutputBuffer<T> {
    return new OutputBufferError<T>(error, settings);
  }
}

/** @hidden */
class OutputBufferFull<T> extends OutputBuffer<T> {
  /** @hidden */
  readonly _value: T;
  /** @hidden */
  readonly _settings: OutputSettings;

  constructor(value: T, settings: OutputSettings) {
    super();
    this._value = value;
    this._settings = settings;
  }

  isCont(): boolean {
    return false;
  }

  isFull(): boolean {
    return true;
  }

  isDone(): boolean {
    return false;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean;
  isPart(isPart: boolean): OutputBuffer<T>;
  isPart(isPart?: boolean): boolean | OutputBuffer<T> {
    if (isPart === void 0) {
      return true;
    } else if (isPart) {
      return OutputBuffer.done(this._value, this._settings);
    } else {
      return this;
    }
  }

  index(): number;
  index(index: number): OutputBuffer<T>;
  index(index?: number): number | OutputBuffer<T> {
    if (index === void 0) {
      return 0;
    } else if (index === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this._settings);
    }
  }

  limit(): number;
  limit(limit: number): OutputBuffer<T>;
  limit(limit?: number): number | OutputBuffer<T> {
    if (limit === void 0) {
      return 0;
    } else if (limit === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this._settings);
    }
  }

  capacity(): number {
    return 0;
  }

  remaining(): number {
    return 0;
  }

  has(index: number): boolean {
    return false;
  }

  get(index: number): number {
    throw new OutputException();
  }

  set(index: number, token: number): void {
    throw new OutputException();
  }

  write(token: number): OutputBuffer<T>;
  write(string: string): OutputBuffer<T>;
  write(tokenOrString: number | string): OutputBuffer<T> {
    return OutputBuffer.error(new OutputException("full"), this._settings);
  }

  writeln(string?: string): OutputBuffer<T> {
    return OutputBuffer.error(new OutputException("full"), this._settings);
  }

  step(offset: number = 1): OutputBuffer<T> {
    if (offset === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this._settings);
    }
  }

  bind(): T {
    return this._value;
  }

  settings(): OutputSettings;
  settings(settings: OutputSettings): OutputBuffer<T>;
  settings(settings?: OutputSettings): OutputSettings | OutputBuffer<T> {
    if (settings === void 0) {
      return this._settings;
    } else {
      return OutputBuffer.full(this._value, settings);
    }
  }

  clone(): OutputBuffer<T> {
    return this;
  }
}

/** @hidden */
class OutputBufferDone<T> extends OutputBuffer<T> {
  /** @hidden */
  readonly _value: T;
  /** @hidden */
  readonly _settings: OutputSettings;

  constructor(value: T, settings: OutputSettings) {
    super();
    this._value = value;
    this._settings = settings;
  }

  isCont(): boolean {
    return false;
  }

  isFull(): boolean {
    return false;
  }

  isDone(): boolean {
    return true;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean;
  isPart(isPart: boolean): OutputBuffer<T>;
  isPart(isPart?: boolean): boolean | OutputBuffer<T> {
    if (isPart === void 0) {
      return false;
    } else if (isPart) {
      return this;
    } else {
      return OutputBuffer.full(this._value, this._settings);
    }
  }

  index(): number;
  index(index: number): OutputBuffer<T>;
  index(index?: number): number | OutputBuffer<T> {
    if (index === void 0) {
      return 0;
    } else if (index === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this._settings);
    }
  }

  limit(): number;
  limit(limit: number): OutputBuffer<T>;
  limit(limit?: number): number | OutputBuffer<T> {
    if (limit === void 0) {
      return 0;
    } else if (limit === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this._settings);
    }
  }

  capacity(): number {
    return 0;
  }

  remaining(): number {
    return 0;
  }

  has(index: number): boolean {
    return false;
  }

  get(index: number): number {
    throw new OutputException();
  }

  set(index: number, token: number): void {
    throw new OutputException();
  }

  write(token: number): OutputBuffer<T>;
  write(string: string): OutputBuffer<T>;
  write(tokenOrString: number | string): OutputBuffer<T> {
    return OutputBuffer.error(new OutputException("done"), this._settings);
  }

  writeln(string?: string): OutputBuffer<T> {
    return OutputBuffer.error(new OutputException("done"), this._settings);
  }

  step(offset: number = 1): OutputBuffer<T> {
    if (offset === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this._settings);
    }
  }

  bind(): T {
    return this._value;
  }

  settings(): OutputSettings;
  settings(settings: OutputSettings): OutputBuffer<T>;
  settings(settings?: OutputSettings): OutputSettings | OutputBuffer<T> {
    if (settings === void 0) {
      return this._settings;
    } else {
      return OutputBuffer.done(this._value, settings);
    }
  }

  clone(): OutputBuffer<T> {
    return this;
  }
}

/** @hidden */
class OutputBufferError<T> extends OutputBuffer<T> {
  /** @hidden */
  readonly _error: Error;
  /** @hidden */
  readonly _settings: OutputSettings;

  constructor(error: Error, settings: OutputSettings) {
    super();
    this._error = error;
    this._settings = settings;
  }

  isCont(): boolean {
    return false;
  }

  isFull(): boolean {
    return false;
  }

  isDone(): boolean {
    return false;
  }

  isError(): boolean {
    return true;
  }

  isPart(): boolean;
  isPart(isPart: boolean): OutputBuffer<T>;
  isPart(isPart?: boolean): boolean | OutputBuffer<T> {
    if (isPart === void 0) {
      return false;
    } else {
      return this;
    }
  }

  index(): number;
  index(index: number): OutputBuffer<T>;
  index(index?: number): number | OutputBuffer<T> {
    if (index === void 0) {
      return 0;
    } else if (index === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this._settings);
    }
  }

  limit(): number;
  limit(limit: number): OutputBuffer<T>;
  limit(limit?: number): number | OutputBuffer<T> {
    if (limit === void 0) {
      return 0;
    } else if (limit === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this._settings);
    }
  }

  capacity(): number {
    return 0;
  }

  remaining(): number {
    return 0;
  }

  has(index: number): boolean {
    return false;
  }

  get(index: number): number {
    throw new OutputException();
  }

  set(index: number, token: number): void {
    throw new OutputException();
  }

  write(token: number): OutputBuffer<T>;
  write(string: string): OutputBuffer<T>;
  write(tokenOrString: number | string): OutputBuffer<T> {
    return this;
  }

  writeln(string?: string): OutputBuffer<T> {
    return this;
  }

  step(offset: number = 1): OutputBuffer<T> {
    if (offset === 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this._settings);
    }
  }

  bind(): T {
    throw new OutputException();
  }

  trap(): Error {
    return this._error;
  }

  settings(): OutputSettings;
  settings(settings: OutputSettings): OutputBuffer<T>;
  settings(settings?: OutputSettings): OutputSettings | OutputBuffer<T> {
    if (settings === void 0) {
      return this._settings;
    } else {
      return OutputBuffer.error(this._error, settings);
    }
  }

  clone(): OutputBuffer<T> {
    return this;
  }
}
