// Copyright 2015-2020 SWIM.AI inc.
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

import {Mark} from "./Mark";
import {InputException} from "./InputException";
import {AnyInputSettings, InputSettings} from "./InputSettings";
import {Input} from "./Input";

/**
 * Non-blocking token stream buffer.
 */
export abstract class InputBuffer extends Input {
  abstract isPart(): boolean;
  abstract isPart(isPart: boolean): InputBuffer;

  abstract index(): number;
  abstract index(index: number): InputBuffer;

  abstract limit(): number;
  abstract limit(limit: number): InputBuffer;

  abstract capacity(): number;

  abstract remaining(): number;

  abstract has(index: number): boolean;

  abstract get(index: number): number;

  abstract set(index: number, token: number): void;

  abstract step(offset?: number): InputBuffer;

  abstract seek(mark: Mark): InputBuffer;

  abstract id(): unknown | null;
  abstract id(id: unknown | null): InputBuffer;

  abstract mark(): Mark;
  abstract mark(mark: Mark): Input;

  abstract settings(): InputSettings;
  abstract settings(settings: AnyInputSettings): Input;

  abstract clone(): InputBuffer;

  private static _emptyBuffer: InputBuffer;

  private static _doneBuffer: InputBuffer;

  /**
   * Returns an `InputBuffer}` in the _empty_ state.
   */
  static empty(id: unknown | null = null, mark: Mark = Mark.zero(),
               settings: InputSettings = InputSettings.standard()): InputBuffer {
    if (id === null && mark === Mark.zero() && settings === InputSettings.standard()) {
      if (!InputBuffer._emptyBuffer) {
        InputBuffer._emptyBuffer = new InputBufferEmpty(null, Mark.zero(), InputSettings.standard());
      }
      return InputBuffer._emptyBuffer;
    }
    return new InputBufferEmpty(id, mark, settings);
  }

  /**
   * Returns an `InputBuffer` in the _done_ state.
   */
  static done(id: unknown | null = null, mark: Mark = Mark.zero(),
              settings: InputSettings = InputSettings.standard()): InputBuffer {
    if (id === null && mark === Mark.zero() && settings === InputSettings.standard()) {
      if (!InputBuffer._doneBuffer) {
        InputBuffer._doneBuffer = new InputBufferDone(null, Mark.zero(), InputSettings.standard());
      }
      return InputBuffer._doneBuffer;
    }
    return new InputBufferDone(id, mark, settings);
  }

  /**
   * Returns an `InputBuffer` in the _error_ state, with the given input `error`.
   */
  static error(error: Error, id: unknown | null = null, mark: Mark = Mark.zero(),
               settings: InputSettings = InputSettings.standard()): InputBuffer {
    return new InputBufferError(error, id, mark, settings);
  }
}

/** @hidden */
class InputBufferEmpty extends InputBuffer {
  /** @hidden */
  readonly _id: unknown | null;
  /** @hidden */
  readonly _mark: Mark;
  /** @hidden */
  readonly _settings: InputSettings;

  constructor(id: unknown | null, mark: Mark, settings: InputSettings) {
    super();
    this._id = id;
    this._mark = mark;
    this._settings = settings;
  }

  isCont(): boolean {
    return false;
  }

  isEmpty(): boolean {
    return true;
  }

  isDone(): boolean {
    return false;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean;
  isPart(isPart: boolean): InputBuffer;
  isPart(isPart?: boolean): boolean | InputBuffer {
    if (isPart === void 0) {
      return true;
    } else if (isPart) {
      return this;
    } else {
      return InputBuffer.done(this._id, this._mark, this._settings);
    }
  }

  index(): number;
  index(index: number): InputBuffer;
  index(index?: number): number | InputBuffer {
    if (index === void 0) {
      return 0;
    } else if (index === 0) {
      return this;
    } else {
      const error = new InputException("invalid index");
      return InputBuffer.error(error, this._id, this._mark, this._settings);
    }
  }

  limit(): number;
  limit(limit: number): InputBuffer;
  limit(limit?: number): number | InputBuffer {
    if (limit === void 0) {
      return 0;
    } else if (limit === 0) {
      return this;
    } else {
      const error = new InputException("invalid limit");
      return InputBuffer.error(error, this._id, this._mark, this._settings);
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
    throw new InputException();
  }

  set(index: number, token: number): void {
    throw new InputException();
  }

  head(): number {
    throw new InputException();
  }

  step(offset?: number): InputBuffer {
    const error = new InputException("empty step");
    return InputBuffer.error(error, this._id, this._mark, this._settings);
  }

  seek(mark: Mark): InputBuffer {
    const error = new InputException("empty seek");
    return InputBuffer.error(error, this._id, this._mark, this._settings);
  }

  id(): unknown | null;
  id(id: unknown | null): InputBuffer;
  id(id?: unknown | null): unknown | null | InputBuffer {
    if (id === void 0) {
      return this._id;
    } else {
      return InputBuffer.empty(id, this._mark, this._settings);
    }
  }

  mark(): Mark;
  mark(mark: Mark): InputBuffer;
  mark(mark?: Mark): Mark | InputBuffer {
    if (mark === void 0) {
      return this._mark;
    } else {
      return InputBuffer.empty(this._id, mark, this._settings);
    }
  }

  settings(): InputSettings;
  settings(settings: InputSettings): InputBuffer;
  settings(settings?: InputSettings): InputSettings | InputBuffer {
    if (settings === void 0) {
      return this._settings;
    } else {
      return InputBuffer.empty(this._id, this._mark, settings);
    }
  }

  clone(): InputBuffer {
    return this;
  }
}

/** @hidden */
class InputBufferDone extends InputBuffer {
  /** @hidden */
  readonly _id: unknown | null;
  /** @hidden */
  readonly _mark: Mark;
  /** @hidden */
  readonly _settings: InputSettings;

  constructor(id: unknown | null, mark: Mark, settings: InputSettings) {
    super();
    this._id = id;
    this._mark = mark;
    this._settings = settings;
  }

  isCont(): boolean {
    return false;
  }

  isEmpty(): boolean {
    return false;
  }

  isDone(): boolean {
    return true;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean;
  isPart(isPart: boolean): InputBuffer;
  isPart(isPart?: boolean): boolean | InputBuffer {
    if (isPart === void 0) {
      return false;
    } else if (isPart) {
      return InputBuffer.empty(this._id, this._mark, this._settings);
    } else {
      return this;
    }
  }

  index(): number;
  index(index: number): InputBuffer;
  index(index?: number): number | InputBuffer {
    if (index === void 0) {
      return 0;
    } else if (index === 0) {
      return this;
    } else {
      const error = new InputException("invalid index");
      return InputBuffer.error(error, this._id, this._mark, this._settings);
    }
  }

  limit(): number;
  limit(limit: number): InputBuffer;
  limit(limit?: number): number | InputBuffer {
    if (limit === void 0) {
      return 0;
    } else if (limit === 0) {
      return this;
    } else {
      const error = new InputException("invalid limit");
      return InputBuffer.error(error, this._id, this._mark, this._settings);
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
    throw new InputException();
  }

  set(index: number, token: number): void {
    throw new InputException();
  }

  head(): number {
    throw new InputException();
  }

  step(offset?: number): InputBuffer {
    const error = new InputException("done step");
    return InputBuffer.error(error, this._id, this._mark, this._settings);
  }

  seek(mark: Mark): InputBuffer {
    const error = new InputException("done seek");
    return InputBuffer.error(error, this._id, this._mark, this._settings);
  }

  id(): unknown | null;
  id(id: unknown | null): InputBuffer;
  id(id?: unknown | null): unknown | null | InputBuffer {
    if (id === void 0) {
      return this._id;
    } else {
      return InputBuffer.done(id, this._mark, this._settings);
    }
  }

  mark(): Mark;
  mark(mark: Mark): InputBuffer;
  mark(mark?: Mark): Mark | InputBuffer {
    if (mark === void 0) {
      return this._mark;
    } else {
      return InputBuffer.done(this._id, mark, this._settings);
    }
  }

  settings(): InputSettings;
  settings(settings: InputSettings): InputBuffer;
  settings(settings?: InputSettings): InputSettings | InputBuffer {
    if (settings === void 0) {
      return this._settings;
    } else {
      return InputBuffer.done(this._id, this._mark, settings);
    }
  }

  clone(): InputBuffer {
    return this;
  }
}

/** @hidden */
class InputBufferError extends InputBuffer {
  /** @hidden */
  readonly _id: unknown | null;
  /** @hidden */
  readonly _mark: Mark;
  /** @hidden */
  readonly _settings: InputSettings;
  /** @hidden */
  readonly _error: Error;

  constructor(error: Error, id: unknown | null, mark: Mark, settings: InputSettings) {
    super();
    this._error = error;
    this._id = id;
    this._mark = mark;
    this._settings = settings;
  }

  isCont(): boolean {
    return false;
  }

  isEmpty(): boolean {
    return false;
  }

  isDone(): boolean {
    return false;
  }

  isError(): boolean {
    return true;
  }

  isPart(): boolean;
  isPart(isPart: boolean): InputBuffer;
  isPart(isPart?: boolean): boolean | InputBuffer {
    if (isPart === void 0) {
      return false;
    } else {
      return this;
    }
  }

  index(): number;
  index(index: number): InputBuffer;
  index(index?: number): number | InputBuffer {
    if (index === void 0) {
      return 0;
    } else if (index === 0) {
      return this;
    } else {
      const error = new InputException("invalid index");
      return InputBuffer.error(error, this._id, this._mark, this._settings);
    }
  }

  limit(): number;
  limit(limit: number): InputBuffer;
  limit(limit?: number): number | InputBuffer {
    if (limit === void 0) {
      return 0;
    } else if (limit === 0) {
      return this;
    } else {
      const error = new InputException("invalid limit");
      return InputBuffer.error(error, this._id, this._mark, this._settings);
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
    throw new InputException();
  }

  set(index: number, token: number): void {
    throw new InputException();
  }

  head(): number {
    throw new InputException();
  }

  step(offset?: number): InputBuffer {
    const error = new InputException("error step");
    return InputBuffer.error(error, this._id, this._mark, this._settings);
  }

  trap(): Error {
    return this._error;
  }

  seek(mark: Mark): InputBuffer {
    const error = new InputException("error seek");
    return InputBuffer.error(error, this._id, this._mark, this._settings);
  }

  id(): unknown | null;
  id(id: unknown | null): InputBuffer;
  id(id?: unknown | null): unknown | null | InputBuffer {
    if (id === void 0) {
      return this._id;
    } else {
      return InputBuffer.error(this._error, id, this._mark, this._settings);
    }
  }

  mark(): Mark;
  mark(mark: Mark): InputBuffer;
  mark(mark?: Mark): Mark | InputBuffer {
    if (mark === void 0) {
      return this._mark;
    } else {
      return InputBuffer.error(this._error, this._id, mark, this._settings);
    }
  }

  settings(): InputSettings;
  settings(settings: InputSettings): InputBuffer;
  settings(settings?: InputSettings): InputSettings | InputBuffer {
    if (settings === void 0) {
      return this._settings;
    } else {
      return InputBuffer.error(this._error, this._id, this._mark, settings);
    }
  }

  clone(): InputBuffer {
    return this;
  }
}
