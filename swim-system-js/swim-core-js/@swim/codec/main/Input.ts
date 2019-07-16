// Copyright 2015-2019 SWIM.AI inc.
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

/**
 * Non-blocking token stream reader, with single token lookahead.
 * `Input` enables incremental, interruptible parsing of network protocols and
 * data formats.
 *
 * ### Input tokens
 * Input tokens are modeled as primitive numbers, commonly representing Unicode
 * code points, or raw octets; each `Input` implementation specifies the
 * semantic type of its tokens.  The [[head]]  method peeks at the lookahead
 * token, without consuming it, and the [[step]] method advances the input to
 * the next token.
 *
 * ### Input states
 * An `Input` reader is always in one of three states: _cont_​inue, _empty_, or
 * _done_.  The _cont_ state indicates that a lookahead token is immediately
 * available; the _empty_ state indicates that no additional tokens are
 * available at this time, but that the stream may logically resume at some
 * point in the future; and the _done_ state indicates that the stream has
 * terminated.  [[isCont]] returns `true` when in the _cont_ state; [[isEmpty]]
 * returns `true` when in the _empty_ state; and [[isDone]] returns `true` when
 * in the _done_ state.
 *
 * ### Non-blocking behavior
 * `Input` readers never block.  An `Input` reader that would otherwise block
 * awaiting additional input instead enters the _empty_ state, signaling the
 * input consumer to back off processing the input, but to remain prepared to
 * process additional input in the future.  An `Input` reader enters the _done_
 * state when it encounters the final end of its input, signaling the input
 * consumer to stop processing.  [[Input.empty]] returns an `Input` reader in
 * the _empty_ state.  [[Input.done]] returns an `Input` reader in the _done_
 * state.
 *
 * ### Position tracking
 * The logical position of the lookahead token is made available via the
 * [[mark]] method, with optimized callouts for the byte [[offset]], one-based
 * [[line]] number, and one-based [[column]] in the current line.  The [[id]]
 * method returns a diagnostic identifier for the token stream.
 *
 * ### Cloning
 * An `Input` reader may be [[clone cloned]] to provide an indepently mutable
 * position into a shared token stream.  Not all `Input` implementations
 * support cloning.
 *
 * @see [[InputSettings]]
 * @see [[Parser]]
 */
export abstract class Input {
  /**
   * Returns `true` when a [[head lookahead]] token is immediately available.
   * i.e. this `Input` is in the _cont_ state.
   */
  abstract isCont(): boolean;

  /**
   * Returns `true` when no lookahead token is currently available, but
   * additional input may be available at some point in the future.  i.e. this
   * `Input` is in the _empty_ state.
   */
  abstract isEmpty(): boolean;

  /**
   * Returns `true` when no lookahead token is currently available, and
   * no additional input will ever become available.  i.e. this `Input` is in
   * the _done_ state.
   */
  abstract isDone(): boolean;

  /**
   * Returns `true` when no lookahead token is currently available due to
   * an error with the token stream. i.e. this `Input` is in the `error` state.
   * When `true`, `trap()` will return the input error
   */
  abstract isError(): boolean;

  /**
   * Returns `true` if this is a partial `Input` will that enter
   * the `empty` state after it consumes the last available input token.
   */
  abstract isPart(): boolean;

   /**
    * Returns a partial `Input` equivalent to this `Input`, if
    * `isPart` is `true`; returns a final `Input` equivalent
    * to this `Input` if `isPart` is `false`. The caller's reference
    * to `this` `Input` should be replaced by the returned `Input`
    */
  abstract isPart(isPart: boolean): Input;

  /**
   * Returns the current lookahead token, if this `Input` is in the
   * _cont_ state.
   *
   * @throws [[InputException]] if this `Input` is not in the _cont_ state.
   */
  abstract head(): number;

  /**
   * Advances to the next token, if this `Input` is in the _cont_ state.
   *
   * @throws `Error` if this `Input` is not in the _cont_ state.
   */
  abstract step(): Input;

  /**
   * Sets the position of this `Input` to the given `mark`.  Rewinds to the
   * start of this `Input`, if `mark` is `undefined`.
   *
   * @throws [[InputException]] if this `Input` does not support seeking,
   *         or is unable to reposition to the `mark`.
   */
  abstract seek(mark?: Mark): Input;

  /**
   * Returns the input error. Only guaranteed to return an error when in the
   * _ error_ state
   *
   * @throws InputException if the `Input` is not the _error_state
   */
  trap(): Error {
    throw new InputException();
  }

  /**
   * Returns an object that identifies the token stream, or `null` if the
   * stream is unidentified.
   */
  abstract id(): unknown | null;

  /**
   * Returns an `Input` equivalent to this `Input`, but logically identified by
   * the given–possibly `null`–`id`.  The caller's reference to `this` `Input}`
   * should be replaced by the returned `Input}`.
   */
  abstract id(id: unknown | null): Input;

  /**
   * Returns the position of the current lookahead token, relative to the start
   * of the stream.
   */
  abstract mark(): Mark;

  /**
   * Returns an `Input` equivalent to this `Input`, but logically positioned at
   * the given `mark`.  The physical position in the input stream is not
   * modified.  The caller's reference to `this` `Input` should be replaced by
   * the returned `Input`.
   */
  abstract mark(mark: Mark): Input;

  /**
   * Returns the byte offset of the current lookahead token, relative to the
   * start of the stream.
   */
  offset(): number {
    return this.mark()._offset;
  }

  /**
   * Returns the one-based line number of the current lookahead token, relative
   * to the start of the stream.
   */
  line(): number {
    return this.mark()._line;
  }

  /**
   * Returns the one-based column number of the current lookahead token,
   * relative to the current line in the stream.
   */
  column(): number {
    return this.mark()._column;
  }

  /**
   * Returns the `InputSettings` used to configure the behavior of input
   * consumers that read from this `Input`.
   */
  abstract settings(): InputSettings;

  /**
   * Returns a clone of this `Input` with the given `settings`.
   *
   * @throws `Error` if this `Input` reader cannot be cloned.
   */
  abstract settings(settings: AnyInputSettings): Input;

  /**
   * Returns an independently positioned view into the token stream,
   * initialized with identical state to this `Input`.
   *
   * @throws `Error` if this `Input` reader cannot be cloned.
   */
  abstract clone(): Input;

  private static _empty: Input;

  private static _done: Input;

  /**
   * Returns an `Input` reader in the _empty_ state, with the given `settings`,
   * at the `mark` position of a token stream logically identified by `id`.
   */
  static empty(id: unknown | null = null, mark: Mark = Mark.zero(),
               settings: InputSettings = InputSettings.standard()): Input {
    if (id === null && mark === Mark.zero() && settings === InputSettings.standard()) {
      if (!Input._empty) {
        Input._empty = new InputEmpty(null, Mark.zero(), InputSettings.standard());
      }
      return Input._empty;
    }
    return new InputEmpty(id, mark, settings);
  }

  /**
   * Returns an `Input` reader in the _done_ state, with the given `settings`,
   * at the `mark` position of a token stream logically identified by `id`.
   */
  static done(id: unknown | null = null, mark: Mark = Mark.zero(),
              settings: InputSettings = InputSettings.standard()): Input {
    if (id === null && mark === Mark.zero() && settings === InputSettings.standard()) {
      if (!Input._done) {
        Input._done = new InputDone(null, Mark.zero(), InputSettings.standard());
      }
      return Input._done;
    }
    return new InputDone(id, mark, settings);
  }

  /**
   * Returns an `Input` in the _error_ state, with the given `settings`,
   * at the `mark` position of a token stream logically identified by `id`.
   */
  static error(error: Error, id: unknown | null = null, mark: Mark = Mark.zero(),
               settings: InputSettings = InputSettings.standard()): Input {
    return new InputError(error, id, mark, settings);
  }
}

/** @hidden */
class InputEmpty extends Input {
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
  isPart(isPart: boolean): Input;
  isPart(isPart?: boolean): boolean | Input {
    if (isPart === void 0) {
      return true;
    } else if (isPart) {
      return this;
    } else {
      return Input.done(this._id, this._mark, this._settings);
    }
  }

  head(): number {
    throw new InputException();
  }

  step(): Input {
    const error = new InputException("empty step");
    return Input.error(error, this._id, this._mark, this._settings);
  }

  seek(mark?: Mark): Input {
    const error = new InputException("empty seek");
    return Input.error(error, this._id, this._mark, this._settings);
  }

  id(): unknown | null;
  id(id: unknown | null): Input;
  id(id?: unknown | null): unknown | null | Input {
    if (id === void 0) {
      return this._id;
    } else {
      return Input.empty(id, this._mark, this._settings);
    }
  }

  mark(): Mark;
  mark(mark: Mark): Input;
  mark(mark?: Mark): Mark | Input {
    if (mark === void 0) {
      return this._mark;
    } else {
      return Input.empty(this._id, mark, this._settings);
    }
  }

  settings(): InputSettings;
  settings(settings: InputSettings): Input;
  settings(settings?: InputSettings): InputSettings | Input {
    if (settings === void 0) {
      return this._settings;
    } else {
      return Input.empty(this._id, this._mark, settings);
    }
  }

  clone(): Input {
    return this;
  }
}

/** @hidden */
class InputDone extends Input {
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
  isPart(isPart: boolean): Input;
  isPart(isPart?: boolean): boolean | Input {
    if (isPart === void 0) {
      return false;
    } else if (isPart) {
      return Input.empty(this._id, this._mark, this._settings);
    } else {
      return this;
    }
  }

  head(): number {
    throw new InputException();
  }

  step(): Input {
    const error = new InputException("done step");
    return Input.error(error, this._id, this._mark, this._settings);
  }

  seek(mark?: Mark): Input {
    const error = new InputException("empty seek");
    return Input.error(error, this._id, this._mark, this._settings);
  }

  id(): unknown | null;
  id(id: unknown | null): Input;
  id(id?: unknown | null): unknown | null | Input {
    if (id === void 0) {
      return this._id;
    } else {
      return Input.done(id, this._mark, this._settings);
    }
  }

  mark(): Mark;
  mark(mark: Mark): Input;
  mark(mark?: Mark): Mark | Input {
    if (mark === void 0) {
      return this._mark;
    } else {
      return Input.done(this._id, mark, this._settings);
    }
  }

  settings(): InputSettings;
  settings(settings: InputSettings): Input;
  settings(settings?: InputSettings): InputSettings | Input {
    if (settings === void 0) {
      return this._settings;
    } else {
      return Input.done(this._id, this._mark, settings);
    }
  }

  clone(): Input {
    return this;
  }
}

/** @hidden */
class InputError extends Input {
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
  isPart(isPart: boolean): Input;
  isPart(isPart?: boolean): boolean | Input {
    if (isPart === void 0) {
      return false;
    } else {
      return this;
    }
  }

  head(): number {
    throw new InputException();
  }

  step(): Input {
    const error = new InputException("error step");
    return Input.error(error, this._id, this._mark, this._settings);
  }

  trap(): Error {
    return this._error;
  }

  seek(mark?: Mark): Input {
    const error = new InputException("error seek");
    return Input.error(error, this._id, this._mark, this._settings);
  }

  id(): unknown | null;
  id(id: unknown | null): Input;
  id(id?: unknown | null): unknown | null | Input {
    if (id === void 0) {
      return this._id;
    } else {
      return Input.error(this._error, id, this._mark, this._settings);
    }
  }

  mark(): Mark;
  mark(mark: Mark): Input;
  mark(mark?: Mark): Mark | Input {
    if (mark === void 0) {
      return this._mark;
    } else {
      return Input.error(this._error, this._id, mark, this._settings);
    }
  }

  settings(): InputSettings;
  settings(settings: InputSettings): Input;
  settings(settings?: InputSettings): InputSettings | Input {
    if (settings === void 0) {
      return this._settings;
    } else {
      return Input.error(this._error, this._id, this._mark, settings);
    }
  }

  clone(): Input {
    return this;
  }
}
