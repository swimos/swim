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

import {Input} from "./Input";
import {ParserException} from "./ParserException";
import {Diagnostic} from "./Diagnostic";

/**
 * Continuation of how to parse subsequent [[Input]] tokens from a stream.
 * `Parser` enables efficient, interruptible parsing of network protocols and
 * data formats, without intermediate buffering.
 *
 * ### Input tokens
 * A `Parser` reads tokens from an `Input` reader.  Input tokens are modeled as
 * primitive numbers, commonly representing Unicode code points, or raw octets.
 * Each `Parser` implementation specifies the semantic type of input tokens it
 * consumes.
 *
 * ### Parser states
 * A `Parser` is always in one of three states: _cont_​inue, _done_, or _error_.
 * The _cont_ state indicates that [[feed]] is ready to consume `Input`; the
 * _done_ state indicates that parsing terminated successfully, and that
 * [[bind]] will return the parsed result; the _error_ state indicates that
 * parsing terminated in failure, and that [[trap]] will return the parse error.
 * `Parser` subclasses default to the _cont_ state.
 *
 * ### Feeding input
 * The [[feed]] method incrementally parses as much `Input` as it can, before
 * returning another `Parser` that represents the continuation of how to parse
 * additional `Input`.  The `Input` passed to `feed` is only guaranteed to be
 * valid for the duration of the method call; references to the provided `Input`
 * instance must not be stored.
 *
 * ### Parser results
 * A `Parser` produces a parsed result of type `O`, obtained via the [[bind]]
 * method.  `bind` is only guaranteed to return a result when in the _done_
 * state; though `bind` may optionally make available partial results in other
 * states.  A failed `Parser` provides a parse error via the [[trap]] method.
 * `trap` is only guaranteed to return an error when in the _error_ state.
 *
 * ### Continuations
 * A `Parser` instance represents a continuation of how to parse remaining
 * `Input`.  Rather than parsing a complete input in one go, a `Parser` takes
 * an `Input` chunk and returns another `Parser` instance that knows how to
 * parse subsequent `Input` chunks.  This enables non-blocking, incremental
 * parsing that can be interrupted whenever an `Input` reader runs out of
 * immediately available data.  A `Parser` terminates by returning a
 * continuation in either the _done_ state, or the _error_ state.
 * [[Parser.done]] returns a `Parser` in the _done_ state.  [[Parser.error]]
 * returns a `Parser` in the _error_ state.
 *
 * ### Iteratees
 * `Parser` is an [Iteratee](https://en.wikipedia.org/wiki/Iteratee).  Though
 * unlike strictly functional iteratees, a `Parser` statefully iterates over
 * its `Input`, rather than allocating an object for each incremental input
 * continutaion.  This internal mutability minimizes garbage collector memory
 * pressure, without violating the functional Iteratee abstraction, provided
 * that `feed` logically takes exclusive ownership of its `Input` when invoked,
 * and logically returns ownership of the `Input` in a state that's consistent
 * with the returned `Parser` continuation.
 *
 * ### Immutability
 * A `Parser` should be immutable.  Specifically, an invocation of `feed`
 * should not alter the behavior of future calls to `feed` on the same `Parser`
 * instance.  A `Parser` should only mutate its internal state if it's essential
 * to do so, such as for critical path performance reasons.
 *
 * ### Backtracking
 * `feed` can internally [[Input.clone clone]] its `Input`, if it might need to
 * backtrack.  Keep in mind that, because `Input` is only valid for the duration
 * of a call to `feed`, input must be internally buffered if it needs to be
 * preserved between `feed` invocations.
 *
 * ### Forking
 * The [[fork]] method passes an out-of-band condition to a `Parser`, yielding
 * a `Parser` continuation whose behavior may be altered by the given condition.
 * For example, an HTML `Parser` might `fork` an inner text parser to directly
 * parse an embedded micro format out of an HTML element, based on some
 * out-of-band schema information.  The types of conditions accepted by `fork`,
 * and their intended semantics, are implementation defined.
 */
export abstract class Parser<O> {
  /**
   * Returns `true` when [[feed]] is able to consume `Input`.  i.e. this
   * `Parser` is in the _cont_ state.
   */
  isCont(): boolean {
    return true;
  }

  /**
   * Returns `true` when parsing has terminated successfully, and [[bind]] will
   * return the parsed result.  i.e. this `Parser` is in the _done_ state.
   */
  isDone(): boolean {
    return false;
  }

  /**
   * Returns `true` when parsing has terminated in failure, and [[trap]] will
   * return the parse error.  i.e. this `Parser` is in the _error_ state.
   */
  isError(): boolean {
    return false;
  }

  /**
   * Incrementally parses as much `Input` as possible, and returns another
   * `Parser` that represents the continuation of how to parse additional
   * `Input`.  The given `input` is only guaranteed to be valid for the
   * duration of the method call; references to `input` must not be stored.
   */

  /**
   * Incrementally parses as much `input` as possible, and returns another
   * `Parser` that represents the continuation of how to parse additional
   * `Input`.  If `input` enters the _done_ state, `feed` _must_ return a
   * terminated `Parser`, i.e. a `Parser` in the _done_ state, or in the
   * _error_ state.  The given `input` is only guaranteed to be valid for the
   * duration of the method call; references to `input` must not be stored.
   */
  abstract feed(input: Input): Parser<O>;

  /**
   * Returns a `Parser` continuation whose behavior may be altered by the
   * given out-of-band `condition`.
   */
  fork(condition: unknown): Parser<O> {
    return this;
  }

  /**
   * Returns the parsed result.  Only guaranteed to return a result when in the
   * _done_ state.
   *
   * @throws `Error` if this `Parser is not in the _done_ state.
   */
  bind(): O {
    throw new Error();
  }

  /**
   * Returns the parse error.  Only guaranteed to return an error when in the
   * _error_ state.
   *
   * @throws `Error` if this `Parser` is not in the _error_ state.
   */
  trap(): Error {
    throw new Error();
  }

  /**
   * Casts an errored `Parser` to a different output type.  A `Parser` in the
   * _error_ state can have any output type.
   *
   * @throws `Error` if this `Parser` is not in the _error_ state.
   */
  asError<O2>(): Parser<O2> {
    throw new Error();
  }

  private static _done?: Parser<any>;

  /**
   * Returns a `Parser` in the _done_ state that `bind`s an `undefined` parsed result.
   */
  static done<O>(): Parser<O>;

  /**
   * Returns a `Parser` in the _done_ state that `bind`s the given parsed `output`.
   */
  static done<O>(output: O): Parser<O>;

  static done<O>(output?: O): Parser<O> {
    if (output === void 0) {
      if (Parser._done === void 0) {
        Parser._done = new ParserDone<any>(void 0);
      }
      return Parser._done;
    } else {
      return new ParserDone<O>(output);
    }
  }

  /**
   * Returns a `Parser` in the _error_ state that `trap`s the given parse `error`.
   */
  static error<O>(error: Error | Diagnostic): Parser<O> {
    if (error instanceof Error) {
      return new ParserError<O>(error);
    } else {
      return new ParserError<O>(new ParserException(error));
    }
  }
}

/** @hidden */
class ParserDone<O> extends Parser<O> {
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

  feed(input: Input): Parser<O> {
    return this;
  }

  bind(): O {
    return this._output;
  }
}

/** @hidden */
class ParserError<O> extends Parser<O> {
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

  feed(input: Input): Parser<O> {
    return this;
  }

  bind(): O {
    throw this._error;
  }

  trap(): Error {
    return this._error;
  }

  asError<O2>(): Parser<O2> {
    return this as any;
  }
}
