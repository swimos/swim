// Copyright 2015-2021 Swim Inc.
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

import {Lazy} from "@swim/util";
import {Mark} from "../source/Mark";
import {InputException} from "./InputException";
import {AnyInputSettings, InputSettings} from "./InputSettings";
import {InputEmpty} from "../"; // forward import
import {InputDone} from "../"; // forward import
import {InputError} from "../"; // forward import

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
   * Returns `true` when no lookahead token is currently available, and no
   * additional input will ever become available.  i.e. this `Input` is in
   * the _done_ state.
   */
  abstract isDone(): boolean;

  /**
   * Returns `true` when no lookahead token is currently available due to an
   * error with the token stream. i.e. this `Input` is in the `error` state.
   * When `true`, `trap()` will return the input error
   */
  abstract isError(): boolean;

  /**
   * Returns `true` if this is a partial `Input` will that enter the _empty_
   * state after it consumes the last available input token.
   */
  abstract isPart(): boolean;

   /**
    * Returns a partial `Input` equivalent to this `Input`, if `part` is `true`;
    * returns a final `Input` equivalent to this `Input` if `part` is `false`.
    * The caller's reference to this `Input` should be replaced by the returned
    * `Input`
    */
  abstract asPart(part: boolean): Input;

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
   * Returns the input error when in the _error_ state
   *
   * @throws InputException if the `Input` is not the _error_state
   */
  trap(): Error {
    throw new InputException();
  }

  /**
   * An informative identifier for this token stream, or `undefined` if this
   * stream is unidentified.
   */
  abstract readonly id: string | undefined;

  /**
   * Returns an `Input` equivalent to this `Input`, but logically identified
   * by the given–possibly `undefined`–`id`.  The caller's reference to this
   * `Input` should be replaced by the returned `Input`.
   */
  abstract withId(id: string | undefined): Input;

  /**
   * The position of the current lookahead token, relative to the start
   * of the stream.
   */
  abstract readonly mark: Mark;

  /**
   * Returns an `Input` equivalent to this `Input`, but logically positioned
   * at the given `mark`.  The physical position in the input stream is not
   * modified.  The caller's reference to this `Input` should be replaced by
   * the returned `Input`.
   */
  abstract withMark(mark: Mark): Input;

  /**
   * The byte offset of the current lookahead token, relative to the start
   * of the stream.
   */
  abstract readonly offset: number;

  /**
   * The one-based line number of the current lookahead token, relative to
   * the start of the stream.
   */
  abstract readonly line: number;

  /**
   * The one-based column number of the current lookahead token, relative to
   * the current line in the stream.
   */
  abstract readonly column: number;

  /**
   * The `InputSettings` used to configure the behavior of input consumers
   * that read from this `Input`.
   */
  abstract readonly settings: InputSettings;

  /**
   * Returns a clone of this `Input` with the given `settings`.
   *
   * @throws `Error` if this `Input` reader cannot be cloned.
   */
  abstract withSettings(settings: AnyInputSettings): Input;

  /**
   * Returns an independently positioned view into the token stream,
   * initialized with identical state to this `Input`.
   *
   * @throws `Error` if this `Input` reader cannot be cloned.
   */
  abstract clone(): Input;

  /**
   * Returns an `Input` reader in the _empty_ state.
   */
  @Lazy
  static empty(): Input {
    return new InputEmpty(void 0, Mark.zero, InputSettings.standard());
  }

  /**
   * Returns an `Input` reader in the _done_ state.
   */
  @Lazy
  static done(): Input {
    return new InputDone(void 0, Mark.zero, InputSettings.standard());
  }

  /**
   * Returns an `Input` in the _error_ state that traps the given `error`.
   */
  static error(error: Error): Input {
    return new InputError(error, void 0, Mark.zero, InputSettings.standard());
  }
}
