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

import {Output} from "./Output";

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
   * @throws `Error` if this `Writer` does not know how to write the given
   *         `input` object.
   */
  feed(input: I): Writer<I, O> {
    throw new Error();
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
    throw new Error();
  }

  /**
   * Returns the write error.  Only guaranteed to return an error when in the
   * _error_ state.
   *
   * @throws `Error` if this `Writer` is not in the _error_ state.
   */
  trap(): Error {
    throw new Error();
  }

  /**
   * Casts a done `Writer` to a different input type.  A `Writer` in the _done_
   * state can have any input type.
   *
   * @throws `Error` if this `Writer` is not in the _done_ state.
   */
  asDone<I2>(): Writer<I2, O> {
    throw new Error();
  }

  /**
   * Casts an errored `Writer` to different input and output types.  A `Writer`
   * in the _error_ state can have any input type, and any output type.
   *
   * @throws `Error` if this `Writer` is not in the _error_ state.
   */
  asError<I2, O2>(): Writer<I2, O2> {
    throw new Error();
  }

  /**
   * Returns a `Writer` that continues writing `that` `Writer`, after it
   * finishes writing `this` `Writer`.
   */
  andThen<O2>(that: Writer<I, O2>): Writer<I, O2> {
    return new WriterAndThen<I, O2>(this, that);
  }

  private static _done?: Writer<any, any>;

  /**
   * Returns a `Writer` in the _done_ state that `bind`s an `undefined`
   * writtern result.
   */
  static done<I, O>(): Writer<I, O>;

  /**
   * Returns a `Writer` in the _done_ state that `bind`s the given
   * written `output`.
   */
  static done<I, O>(output: O): Writer<I, O>;

  static done<I, O>(output?: O): Writer<I, O> {
    if (output === void 0) {
      if (Writer._done === void 0) {
        Writer._done = new WriterDone<any, any>(void 0);
      }
      return Writer._done;
    } else {
      return new WriterDone<I, O>(output);
    }
  }

  /**
   * Returns a `Writer` in the _error_ state that `trap`s the given
   * write `error`.
   */
  static error<I, O>(error: Error): Writer<I, O> {
    return new WriterError<I, O>(error);
  }
}

/** @hidden */
class WriterDone<I, O> extends Writer<I, O> {
  /** @hidden */
  readonly _output: O;

  constructor(output: O) {
    super();
    this._output = output;
  }

  isCont(): boolean {
    return false;
  }

  isDone(): boolean {
    return true;
  }

  pull(output: Output): Writer<I, O> {
    return this;
  }

  bind(): O {
    return this._output;
  }

  asDone<I2>(): Writer<I2, O> {
    return this as any;
  }

  andThen<O2>(that: Writer<I, O2>): Writer<I, O2> {
    return that;
  }
}

/** @hidden */
class WriterError<I, O> extends Writer<I, O> {
  /** @hidden */
  readonly _error: Error;

  constructor(error: Error) {
    super();
    this._error = error;
  }

  isCont(): boolean {
    return false;
  }

  isError(): boolean {
    return true;
  }

  pull(output: Output): Writer<I, O> {
    return this;
  }

  bind(): O {
    throw this._error;
  }

  trap(): Error {
    return this._error;
  }

  asError<I2, O2>(): Writer<I2, O2> {
    return this as any;
  }

  andThen<O2>(that: Writer<I, O2>): Writer<I, O2> {
    return this as any;
  }
}

/** @hidden */
class WriterAndThen<I, O> extends Writer<I, O> {
  /** @hidden */
  readonly _head: Writer<I, any>;
  /** @hidden */
  readonly _tail: Writer<I, O>;

  constructor(head: Writer<I, any>, tail: Writer<I, O>) {
    super();
    this._head = head;
    this._tail = tail;
  }

  pull(output: Output): Writer<I, O> {
    let head = this._head;
    if (head.isCont()) {
      head = head.pull(output);
    }
    if (head.isError()) {
      return head.asError();
    } else if (head.isDone()) {
      return this._tail.pull(output);
    } else {
      return new WriterAndThen<I, O>(head, this._tail);
    }
  }
}
