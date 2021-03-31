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

import {Lazy, Builder} from "@swim/util";
import {OutputException} from "./OutputException";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {OutputFull} from "../"; // forward import
import {OutputDone} from "../"; // forward import
import {OutputError} from "../"; // forward import
import {Format} from "../"; // forward import

/**
 * Non-blocking token stream writer.  `Output` enables incremental,
 * interruptible writing of network protocols and data formats.
 *
 * ### Output tokens
 * Output tokens are modeled as primitive numbers, commonly representing
 * Unicode code points, or raw octets; each `Output` implementation specifies
 * the semantic type of its tokens.
 *
 * ### Output states
 * An `Output` writer is always in one of three states: _cont_​inue, _full_,
 * or _done_.  The _cont_ state indicates that the stream is ready to write a
 * single token; the _full_ state indicates that the stream is unable to write
 * additional tokens at this time, but that the stream may logically resume at
 * some point in the future; and the _done_ state indicates that the stream has
 * terminated, and that [[bind]] will return the output result.  [[isCont]]
 * returns `true` when in the _cont_ state; [[isFull]] returns `true` when in
 * the _full_ state; and [[isDone]] returns `true` when in the _done_ state.
 *
 * ### Output results
 * An `Output` writer yields a value of type `T`, obtained via the [[bind]]
 * method, representing some implementation defined result of writing the
 * output.  For example, an `Output<string>` implementation may–but is not
 * required to–yield a `string` containing all code points written to the
 * output.
 *
 * ### Non-blocking behavior
 * `Output` writers never block.  An `Output` writer that would otherwise block
 * writing additional output instead enters the _full_ state, signaling the
 * output generator to back off producing the output, but to remain prepared to
 * produce additional output in the future.  An `Output` writer enters the
 * _done_ state when it encounters the final end of its output, signaling to
 * the output generator to stop producing.
 *
 * ### Output settings
 * An output generator may alter the tokens it produces based on its `Output`
 * writer's [[settings]].  Uses include pretty printing and styling generated
 * output.  [[OutputSettings]] subclasses can provide additional parameters
 * understood by specialized output producers.
 *
 * ### Cloning
 * An `Output` writer may be [[clone cloned]] to branch the token stream in an
 * implementation specified manner.  Not all `Output` implementations support
 * cloning.
 *
 * @see [[OutputSettings]]
 * @see [[Writer]]
 */
export abstract class Output<T = unknown> implements Builder<number, T> {
  /**
   * Returns `true` when the next [[write write(number)]] will succeed.
   * i.e. this `Output` is in the _cont_ state.
   */
  abstract isCont(): boolean;

  /**
   * Returns `true` when an immediate `write` will fail, but writes may succeed
   * at some point in the future.  i.e. this `Output` is in the _full_ state.
   */
  abstract isFull(): boolean;

  /**
   * Returns `true` when no `write` will ever again suucced.
   * i.e. this `Output` is in the _done_ state.
   */
  abstract isDone(): boolean;

  /**
   * Returns `true` when an immediate `write` will fail due to an
   * error with the token stream. i.e. this `Output` is in the `error` state.
   * When `true`, `trap()` will return the output error.
   */
  abstract isError(): boolean;

  /**
   * Returns `true` if this is a partial `Output` that will enter
   * the `full` state when it is unable to write additional tokens.
   */
  abstract isPart(): boolean;

  /**
   * Returns a partial `Output` equivalent to this `Output`, if `part` is `true`;
   * returns a final `Output` equivalent to this `Output` if `part` is `false`.
   * The caller's reference to this `Output` should be replaced by the returned
   * `Output`.
   */
  abstract asPart(part: boolean): Output<T>;

  /**
   * Writes a single `token` to the stream, if this `Output` is in the
   * _cont_ state.
   *
   * @return `this`
   * @throws [[OutputException]] if this `Output` is not in the _cont_ state.
   */
  abstract write(token: number): Output<T>;

  /**
   * Writes the code points of the given `string`.  Assumes this is a Unicode
   * `Output` writer with sufficient capacity.
   *
   * @return `this`
   * @throws [[OutputException]] if this `Output` exits the _cont_ state before
   *         the full `string` has been written.
   */
  abstract write(string: string): Output<T>;

  /**
   * Writes the code points of the given `string`, followed by the code points
   * of the `settings`' [[OutputSettings.lineSeparator line separator].
   * Assumes this is a Unicode `Output` writer with sufficient capacity.
   *
   * @return `this`
   * @throws [[OutputException]] if this `Output` exits the _cont_ state before
   *         the full `string` and line separator has been written.
   */
  writeln(string?: string): Output<T> {
    if (typeof string === "string") {
      this.write(string);
    }
    return this.write(this.settings.lineSeparator);
  }

  /**
   * Writes the code points of the human-readable [[Display]] string of the
   * given `object`.  Assumes this is a Unicode `Output` writer with sufficient
   * capacity.
   *
   * @return `this`
   * @throws [[OutputException]] if this `Output` exits the _cont_ state before
   *         the full display string has been written.
   */
  display(object: unknown): Output<T> {
    Format.display(object, this);
    return this;
  }

  /**
   * Writes the code points of the developer-readable [[Debug]] string of the
   * given `object`.  Assumes this is a Unicode `Output` writer with sufficient
   * capacity.
   *
   * @return `this`
   * @throws [[OutputException]] if this `Output` exits the _cont_ state before
   *         the full debug string has been written.
   */
  debug(object: unknown): Output<T> {
    Format.debug(object, this);
    return this;
  }

  /**
   * Writes any internally buffered state to the underlying output stream.
   */
  flush(): Output<T> {
    return this;
  }

  push(...tokens: number[]): void {
    const n = tokens.length;
    for (let i = 0; i < n; i += 1) {
      this.write(tokens[i]!);
    }
  }

  /**
   * The `OutputSettings` used to configure the behavior of output producers
   * that write to this `Output`.
   */
  abstract readonly settings: OutputSettings;

  /**
   * Updates the `settings` associated with this `Output`.
   *
   * @return `this`
   */
  abstract withSettings(settings: AnyOutputSettings): Output<T>;

  /**
   * Returns the implementation-defined result of writing the output.
   */
  abstract bind(): T;

  /**
   * Returns the output error. Only guaranteed to return an error when in the
   * _error_ state.
   *
   * @throws OutputException if this `Output` is not in the _error_ state.
   */
  trap(): Error {
    throw new OutputException();
  }

  /**
   * Returns an implementation-defined branch of the token stream.
   *
   * @throws `Error` if this `Output` writer cannot be cloned.
   */
  clone(): Output<T> {
    throw new Error();
  }

  /**
   * Return an `Output` in the _full_ state.
   */
  @Lazy
  static full(): Output<never> {
    return new OutputFull(OutputSettings.standard());
  }

  /**
   * Returns an `Output` in the _done_ state.
   */
  @Lazy
  static done(): Output<never> {
    return new OutputDone(OutputSettings.standard());
  }

  /**
   * Return an `Output` in the _error_ state that traps the given `error`.
   */
  static error(error: Error): Output<never> {
    return new OutputError(error, OutputSettings.standard());
  }
}
