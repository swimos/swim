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
import type {Output} from "../output/Output";
import {WriterException} from "./WriterException";
import {WriterEnd} from "../"; // forward import
import {WriterDone} from "../"; // forward import
import {WriterError} from "../"; // forward import
import {WriterSequence} from "../"; // forward import

/**
 * Continuation of how to write subsequent [[Output]] tokens to a stream.
 * `Writer` enables efficient, interruptible writing of network protocols and
 * data formats, without intermediate buffering.
 *
 * ### Output tokens
 * A `Writer` writes tokens to an `Output` writer.  Output tokens are modeled
 * as primitive numbers, commonly representing Unicode code points, or raw
 * octets.  Each `Writer` implementation specifies the semantic type of output
 * tokens it produces.
 *
 * ### Writer states
 * A `Writer` is always in one of three states: _cont_​inue, _done_, or _error_.
 * The _cont_ state indicates that [[pull]] is ready to produce `Output`; the
 * _done_ state indicates that writing terminated successfully, and that
 * [[bind]] will return the written result; the _error_ state indicates that
 * writing terminated in failure, and that [[trap]] will return the write error.
 * `Writer` subclasses default to the _cont_ state.
 *
 * ### Feeding input
 * The [[feed]] method returns a `Writer` that represents the continuation
 * of how to write the given input object to subsequent `Output` writers.
 * `feed` can be used to specify an initial object to write, or to change
 * the object to be written.
 *
 * ### Pulling output
 * The [[pull]] method incrementally writes as much `Output` as it can, before
 * returning another `Writer` that represents the continuation of how to write
 * additional `Output`.  The `Output` passed to `pull` is only guaranteed to be
 * valid for the duration of the method call; references to the provided
 * `Output` instance must not be stored.
 *
 * ### Writer results
 * A `Writer` produces a written result of type `O`, obtained via the [[bind]]
 * method.  `bind` is only guaranteed to return a result when in the _done_
 * state; though `bind` may optionally make available partial results in other
 * states.  A failed `Writer` provides a write error via the [[trap]] method.
 * `trap` is only guaranteed to return an error when in the _error_ state.
 *
 * ### Continuations
 * A `Writer` instance represents a continuation of how to write remaining
 * `Output`.  Rather than writing a complete output in one go, a `Writer` takes
 * an `Output` chunk and returns another `Writer` instance that knows how to
 * write subsequent `Output` chunks.  This enables non-blocking, incremental
 * writing that can be interrupted whenever an `Output` writer runs out of
 * space.  A `Writer` terminates by returning a continuation in either the
 * _done_ state, or the _error_ state.  [[Writer.done]] returns a `Writer` in
 * the _done_ state.  [[Writer.error]] returns a `Writer` in the _error_ state.
 *
 * ### Forking
 * The [[fork]] method passes an out-of-band condition to a `Writer`, yielding
 * a `Writer` continuation whose behavior may be altered by the given condition.
 * For example, a console `Writer` might support a `fork` condition that changes
 * the color and style of printed text.  The types of conditions accepted by
 * `fork`, and their intended semantics, are implementation defined.
 */
export abstract class Writer<I = unknown, O = unknown> {
  /**
   * Returns `true` when [[pull]] is able to produce `Output`.  i.e. this
   * `Writer` is in the _cont_ state.
   */
  isCont(): boolean {
    return true;
  }

  /**
   * Returns `true` when writing has terminated successfully, and [[bind]] will
   * return the written result.  i.e. this `Writer` is in the _done_ state.
   */
  isDone(): boolean {
    return false;
  }

  /**
   * Returns `true` when writing has terminated in failure, and [[trap]] will
   * return the write error.  i.e. this `Writer` is in the _error_ state.
   */
  isError(): boolean {
    return false;
  }

  /**
   * Returns a `Writer` that represents the continuation of how to write the
   * given `input` object.
   *
   * @throws `WriterException` if this `Writer` does not know how to write the
   *         given `input` object.
   */
  feed(input: I): Writer<I, O> {
    throw new WriterException();
  }

  /**
   * Incrementally writes as much `output` as possible, and returns another
   * `Writer` that represents the continuation of how to write additional
   * `Output`.  If `output` enters the _done_ state, `pull` _must_ return a
   * terminated `Writer`, i.e. a `Writer` in the _done_ state, or in the
   * _error_ state.  The given `output` is only guaranteed to be valid for the
   * duration of the method call; references to `output` must not be stored.
   */
  abstract pull(output: Output): Writer<I, O>;

  /**
   * Returns a `Writer` continuation whose behavior may be altered by the given
   * out-of-band `condition`.
   */
  fork(condition: unknown): Writer<I, O> {
    return this;
  }

  /**
   * Returns the written result.  Only guaranteed to return a result when in
   * the _done_ state.
   *
   * @throws `Error` if this `Writer` is not in the _done_ state.
   */
  bind(): O {
    throw new WriterException();
  }

  /**
   * Returns the write error.  Only guaranteed to return an error when in the
   * _error_ state.
   *
   * @throws `Error` if this `Writer` is not in the _error_ state.
   */
  trap(): Error {
    throw new WriterException();
  }

  /**
   * Casts a done `Writer` to a different input type.  A `Writer` in the _done_
   * state can have any input type.
   *
   * @throws `WriterException` if this `Writer` is not in the _done_ state.
   */
  asDone<I2>(): Writer<I2, O> {
    throw new WriterException();
  }

  /**
   * Casts an errored `Writer` to different input and output types.  A `Writer`
   * in the _error_ state can have any input type, and any output type.
   *
   * @throws `WriterException` if this `Writer` is not in the _error_ state.
   */
  asError<I2, O2>(): Writer<I2, O2> {
    throw new WriterException();
  }

  /**
   * Returns a `Writer` that continues writing `that` `Writer`, after it
   * finishes writing this `Writer`.
   */
  andThen<O2>(that: Writer<unknown, O2>): Writer<never, O2> {
    return new WriterSequence(this, that);
  }

  /**
   * Returns a `Writer` in the _done_ state that never binds a value.
   */
  @Lazy
  static end<I>(): Writer<I, never> {
    return new WriterEnd();
  }

  /**
   * Returns a `Writer` in the _done_ state that binds the given written `value`.
   */
  static done<I, O>(value: O): Writer<I, O> {
    return new WriterDone(value);
  }

  /**
   * Returns a `Writer` in the _error_ state that traps the given write `error`.
   */
  static error<I, O>(error: Error): Writer<I, O> {
    return new WriterError(error);
  }
}
