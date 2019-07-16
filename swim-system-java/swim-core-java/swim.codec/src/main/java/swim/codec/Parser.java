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

package swim.codec;

/**
 * Continuation of how to parse subsequent {@link Input} tokens from a stream.
 * {@code Parser} enables efficient, interruptible parsing of network protocols
 * and data formats, without intermediate buffering.
 *
 * <h3>Input tokens</h3>
 * <p>A {@code Parser} reads tokens from an {@code Input} reader.  Input tokens
 * are modeled as primitive {@code int}s, commonly representing Unicode code
 * points, or raw octets.  Each {@code Parser} implementation specifies the
 * semantic type of input tokens it consumes.</p>
 *
 * <h3>Parser states</h3>
 * <p>A {@code Parser} is always in one of three states: <em>cont</em>inue,
 * <em>done</em>, or <em>error</em>.  The <em>cont</em> state indicates that
 * {@link #feed(Input) feed} is ready to consume {@code Input}; the
 * <em>done</em> state indicates that parsing terminated successfully, and that
 * {@link #bind() bind} will return the parsed result; the <em>error</em> state
 * indicates that parsing terminated in failure, and that {@link #trap() trap}
 * will return the parse error.  {@code Parser} subclasses default to the
 * <em>cont</em> state.</p>
 *
 * <h3>Feeding input</h3>
 * <p>The {@link #feed(Input)} method incrementally parses as much {@code
 * Input} as it can, before returning another {@code Parser} that represents
 * the continuation of how to parse additional {@code Input}.  The {@code Input}
 * passed to {@code feed} is only guaranteed to be valid for the duration of
 * the method call; references to the provided {@code Input} instance must not
 * be stored.</p>
 *
 * <h3>Parser results</h3>
 * <p>A {@code Parser} produces a parsed result of type {@code O}, obtained
 * via the {@link #bind()} method.  {@code bind} is only guaranteed to return a
 * result when in the <em>done</em> state; though {@code bind} may optionally
 * make available partial results in other states.  A failed {@code Parser}
 * provides a parse error via the {@link #trap()} method.  {@code trap} is only
 * guaranteed to return an error when in the <em>error</em> state.</p>
 *
 * <h3>Continuations</h3>
 * <p>A {@code Parser} instance represents a continuation of how to parse
 * remaining {@code Input}.  Rather than parsing a complete input in one go,
 * a {@code Parser} takes an {@code Input} chunk and returns another {@code
 * Parser} instance that knows how to parse subsequent {@code Input} chunks.
 * This enables non-blocking, incremental parsing that can be interrupted
 * whenever an {@code Input} reader runs out of immediately available data.
 * A {@code Parser} terminates by returning a continuation in either the
 * <em>done</em> state, or the <em>error</em> state.
 * {@link Parser#done(Object)} returns a {@code Parser} in the <em>done</em>
 * state.  {@link Parser#error(Throwable)} returns a {@code Parser} in the
 * <em>error</em> state.</p>
 *
 * <h3>Iteratees</h3>
 * <p>{@code Parser} is an <a href="https://en.wikipedia.org/wiki/Iteratee">
 * Iteratee</a>.  Though unlike strictly functional iteratees, a {@code Parser}
 * statefully iterates over its {@code Input}, rather than allocating an object
 * for each incremental input continutaion.  This internal mutability minimizes
 * garbage collector memory pressure, without violating the functional Iteratee
 * abstraction, provided that {@code feed} logically takes exclusive ownership
 * of its {@code Input} when invoked, and logically returns ownership of the
 * {@code Input} in a state that's consistent with the returned {@code Parser}
 * continuation.</p>
 *
 * <h3>Immutability</h3>
 * <p>A {@code Parser} should be immutable.  Specifically, an invocation of
 * {@code feed} should not alter the behavior of future calls to {@code feed}
 * on the same {@code Parser} instance.  A {@code Parser} should only mutate
 * its internal state if it's essential to do so, such as for critical path
 * performance reasons.</p>
 *
 * <h3>Backtracking</h3>
 * <p>{@code feed} can internally {@link Input#clone() clone} its {@code
 * Input}, if it might need to backtrack.  Keep in mind that, because {@code
 * Input} is only valid for the duration of a call to {@code feed}, input must
 * be internally buffered if it needs to be preserved between {@code feed}
 * invocations.</p>
 *
 * <h3>Forking</h3>
 * <p>The {@link #fork(Object)} method passes an out-of-band condition to a
 * {@code Parser}, yielding a {@code Parser} continuation whose behavior may
 * be altered by the given condition.  For example, an HTML {@code Parser}
 * might {@code fork} an inner text parser to directly parse an embedded micro
 * format out of an HTML element, based on some out-of-band schema information.
 * The types of conditions accepted by {@code fork}, and their intended
 * semantics, are implementation defined.</p>
 */
public abstract class Parser<O> extends Decoder<O> {
  /**
   * Returns {@code true} when {@link #feed(Input) feed} is able to consume
   * {@code Input}.  i.e. this {@code Parser} is in the <em>cont</em> state.
   */
  @Override
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when parsing has terminated successfully, and {@link
   * #bind() bind} will return the parsed result.  i.e. this {@code Parser} is
   * in the <em>done</em> state.
   */
  @Override
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when parsing has terminated in failure, and {@link
   * #trap() trap} will return the parse error.  i.e. this {@code Parser} is in
   * the <em>error</em> state.
   */
  @Override
  public boolean isError() {
    return false;
  }

  /**
   * Incrementally parses as much {@code input} as possible, and returns
   * another {@code Parser} that represents the continuation of how to parse
   * additional {@code Input}.  If {@code input} enters the <em>done</em> state,
   * {@code feed} <em>must</em> return a terminated {@code Parser}, i.e. a
   * {@code Parser} in the <em>done</em> state, or in the <em>error</em> state.
   * The given {@code input} is only guaranteed to be valid for the duration of
   * the method call; references to {@code input} must not be stored.
   */
  public abstract Parser<O> feed(Input input);

  @Override
  public Parser<O> feed(InputBuffer input) {
    return feed((Input) input);
  }

  /**
   * Returns a {@code Parser} continuation whose behavior may be altered by the
   * given out-of-band {@code condition}.
   */
  @Override
  public Parser<O> fork(Object condition) {
    return this;
  }

  /**
   * Returns the parsed result.  Only guaranteed to return a result when in the
   * <em>done</em> state.
   *
   * @throws IllegalStateException if this {@code Parser} is not in the
   *         <em>done</em> state.
   */
  @Override
  public O bind() {
    throw new IllegalStateException();
  }

  /**
   * Returns the parse error.  Only guaranteed to return an error when in the
   * <em>error</em> state.
   *
   * @throws IllegalStateException if this {@code Parser} is not in the
   *         <em>error</em> state.
   */
  @Override
  public Throwable trap() {
    throw new IllegalStateException();
  }

  /**
   * Casts an errored {@code Parser} to a different output type.
   * A {@code Parser} in the <em>error</em> state can have any output type.
   *
   * @throws IllegalStateException if this {@code Parser} is not in the
   *         <em>error</em> state.
   */
  @Override
  public <O2> Parser<O2> asError() {
    throw new IllegalStateException();
  }

  private static Parser<Object> done;

  /**
   * Returns a {@code Parser} in the <em>done</em> state that {@code bind}s
   * a {@code null} parsed result.
   */
  @SuppressWarnings("unchecked")
  public static <O> Parser<O> done() {
    if (done == null) {
      done = new ParserDone<Object>(null);
    }
    return (Parser<O>) done;
  }

  /**
   * Returns a {@code Parser} in the <em>done</em> state that {@code bind}s
   * the given parsed {@code output}.
   */
  public static <O> Parser<O> done(O output) {
    if (output == null) {
      return done();
    } else {
      return new ParserDone<O>(output);
    }
  }

  /**
   * Returns a {@code Parser} in the <em>error</em> state that {@code trap}s
   * the given parse {@code error}.
   */
  public static <O> Parser<O> error(Throwable error) {
    return new ParserError<O>(error);
  }

  /**
   * Returns a {@code Parser} in the <em>error</em> state that {@code trap}s a
   * {@link ParserException} with the given {@code diagnostic}.
   */
  public static <O> Parser<O> error(Diagnostic diagnostic) {
    return error(new ParserException(diagnostic));
  }
}

final class ParserDone<O> extends Parser<O> {
  final O output;

  ParserDone(O output) {
    this.output = output;
  }

  @Override
  public boolean isCont() {
    return false;
  }

  @Override
  public boolean isDone() {
    return true;
  }

  @Override
  public Parser<O> feed(Input input) {
    return this;
  }

  @Override
  public O bind() {
    return this.output;
  }
}

final class ParserError<O> extends Parser<O> {
  final Throwable error;

  ParserError(Throwable error) {
    this.error = error;
  }

  @Override
  public boolean isCont() {
    return false;
  }

  @Override
  public boolean isError() {
    return true;
  }

  @Override
  public Parser<O> feed(Input input) {
    return this;
  }

  @Override
  public O bind() {
    if (this.error instanceof Error) {
      throw (Error) this.error;
    } else if (this.error instanceof RuntimeException) {
      throw (RuntimeException) this.error;
    } else {
      throw new ParserException(this.error);
    }
  }

  @Override
  public Throwable trap() {
    return this.error;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <O2> Parser<O2> asError() {
    return (Parser<O2>) this;
  }
}
