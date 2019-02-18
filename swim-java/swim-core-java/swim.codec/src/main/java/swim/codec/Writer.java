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
 * Continuation of how to write subsequent {@link Output} tokens to a stream.
 * {@code Writer} enables efficient, interruptible writing of network protocols
 * and data formats, without intermediate buffering.
 *
 * <h3>Output tokens</h3>
 * <p>A {@code Writer} writes tokens to an {@code Output} writer.  Output
 * tokens are modeled as primitive {@code int}s, commonly representing Unicode
 * code points, or raw octets.  Each {@code Writer} implementation specifies
 * the semantic type of output tokens it produces.</p>
 *
 * <h3>Writer states</h3>
 * <p>A {@code Writer} is always in one of three states: <em>cont</em>inue,
 * <em>done</em>, or <em>error</em>.  The <em>cont</em> state indicates that
 * {@link #pull(Output) pull} is ready to produce {@code Output}; the
 * <em>done</em> state indicates that writing terminated successfully, and that
 * {@link #bind() bind} will return the written result; the <em>error</em>
 * state indicates that writing terminated in failure, and that {@link #trap()
 * trap} will return the write error.  {@code Writer} subclasses default to the
 * <em>cont</em> state.</p>
 *
 * <h3>Feeding input</h3>
 * <p>The {@link #feed(Object) feed(I)} method returns a {@code Writer} that
 * represents the continuation of how to write the given input object to
 * subsequent {@code Output} writers.  {@code feed} can be used to specify
 * an initial object to write, or to change the object to be written.</p>
 *
 * <h3>Pulling output</h3>
 * <p>The {@link #pull(Output)} method incrementally writes as much {@code
 * Output} as it can, before returning another {@code Writer} that represents
 * the continuation of how to write additional {@code Output}.  The {@code
 * Output} passed to {@code pull} is only guaranteed to be valid for the
 * duration of the method call; references to the provided {@code Output}
 * instance must not be stored.</p>
 *
 * <h3>Writer results</h3>
 * <p>A {@code Writer} produces a written result of type {@code O}, obtained
 * via the {@link #bind()} method.  {@code bind} is only guaranteed to return a
 * result when in the <em>done</em> state; though {@code bind} may optionally
 * make available partial results in other states.  A failed {@code Writer}
 * provides a write error via the {@link #trap()} method.  {@code trap} is only
 * guaranteed to return an error when in the <em>error</em> state.</p>
 *
 * <h3>Continuations</h3>
 * <p>A {@code Writer} instance represents a continuation of how to write
 * remaining {@code Output}.  Rather than writing a complete output in one go,
 * a {@code Writer} takes an {@code Output} chunk and returns another {@code
 * Writer} instance that knows how to write subsequent {@code Output} chunks.
 * This enables non-blocking, incremental writing that can be interrupted
 * whenever an {@code Output} writer runs out of space.  A {@code Writer}
 * terminates by returning a continuation in either the <em>done</em> state,
 * or the <em>error</em> state.  {@link Writer#done(Object)} returns a {@code
 * Writer} in the <em>done</em> state.  {@link Writer#error(Throwable)} returns
 * a {@code Writer} in the <em>error</em> state.</p>
 *
 * <h3>Forking</h3>
 * <p>The {@link #fork(Object)} method passes an out-of-band condition to a
 * {@code Writer}, yielding a {@code Writer} continuation whose behavior may
 * be altered by the given condition.  For example, a console {@code Writer}
 * might support a {@code fork} condition that changes the color and style of
 * printed text.  The types of conditions accepted by {@code fork}, and their
 * intended semantics, are implementation defined.</p>
 */
public abstract class Writer<I, O> extends Encoder<I, O> {
  /**
   * Returns {@code true} when {@link #pull(Output) pull} is able to produce
   * {@code Output}.  i.e. this {@code Writer} is in the <em>cont</em> state.
   */
  @Override
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when writing has terminated successfully, and {@link
   * #bind() bind} will return the written result.  i.e. this {@code Writer} is
   * in the <em>done</em> state.
   */
  @Override
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when writing has terminated in failure, and {@link
   * #trap() trap} will return the write error.  i.e. this {@code Writer} is in
   * the <em>error</em> state.
   */
  @Override
  public boolean isError() {
    return false;
  }

  /**
   * Returns a {@code Writer} that represents the continuation of how to write
   * the given {@code input} object.
   *
   * @throws IllegalArgumentException if this {@code Writer} does not know how
   *         to write the given {@code input} object.
   */
  @Override
  public Writer<I, O> feed(I input) {
    throw new IllegalArgumentException();
  }

  /**
   * Incrementally writes as much {@code output} as possible, and returns
   * another {@code Writer} that represents the continuation of how to write
   * additional {@code Output}.  If {@code output} enters the <em>done</em>
   * state, {@code pull} <em>must</em> return a terminated {@code Writer},
   * i.e. a {@code Writer} in the <em>done</em> state, or in the <em>error</em>
   * state.  The given {@code output} is only guaranteed to be valid for the
   * duration of the method call; references to {@code output} must not be
   * stored.
   */
  public abstract Writer<I, O> pull(Output<?> output);

  @Override
  public Writer<I, O> pull(OutputBuffer<?> output) {
    return pull((Output<?>) output);
  }

  /**
   * Returns a {@code Writer} continuation whose behavior may be altered by the
   * given out-of-band {@code condition}.
   */
  @Override
  public Writer<I, O> fork(Object condition) {
    return this;
  }

  /**
   * Returns the written result.  Only guaranteed to return a result when in
   * the <em>done</em> state.
   *
   * @throws IllegalStateException if this {@code Writer} is not in the
   *         <em>done</em> state.
   */
  @Override
  public O bind() {
    throw new IllegalStateException();
  }

  /**
   * Returns the write error.  Only guaranteed to return an error when in the
   * <em>error</em> state.
   *
   * @throws IllegalStateException if this {@code Writer} is not in the
   *         <em>error</em> state.
   */
  @Override
  public Throwable trap() {
    throw new IllegalStateException();
  }

  /**
   * Casts a done {@code Writer} to a different input type.
   * A {@code Writer} in the <em>done</em> state can have any input type.
   *
   * @throws IllegalStateException if this {@code Writer} is not in the
   *         <em>done</em> state.
   */
  @Override
  public <I2> Writer<I2, O> asDone() {
    throw new IllegalStateException();
  }

  /**
   * Casts an errored {@code Writer} to different input and output types.
   * A {@code Writer} in the <em>error</em> state can have any input type,
   * and any output type.
   *
   * @throws IllegalStateException if this {@code Writer} is not in the
   *         <em>error</em> state.
   */
  @Override
  public <I2, O2> Writer<I2, O2> asError() {
    throw new IllegalStateException();
  }

  /**
   * Returns a {@code Writer} that continues writing {@code that} {@code
   * Writer}, after it finishes writing {@code this} {@code Writer}.
   */
  public <O2> Writer<I, O2> andThen(Writer<I, O2> that) {
    return new WriterAndThen<I, O2>(this, that);
  }

  @Override
  public <O2> Writer<I, O2> andThen(Encoder<I, O2> that) {
    return andThen((Writer<I, O2>) that);
  }

  private static Writer<Object, Object> done;

  /**
   * Returns a {@code Writer} in the <em>done</em> state that {@code bind}s
   * a {@code null} written result.
   */
  @SuppressWarnings("unchecked")
  public static <I, O> Writer<I, O> done() {
    if (done == null) {
      done = new WriterDone<Object, Object>(null);
    }
    return (Writer<I, O>) done;
  }

  /**
   * Returns a {@code Writer} in the <em>done</em> state that {@code bind}s
   * the given written {@code output}.
   */
  public static <I, O> Writer<I, O> done(O output) {
    if (output == null) {
      return done();
    } else {
      return new WriterDone<I, O>(output);
    }
  }

  /**
   * Returns a {@code Writer} in the <em>error</em> state that {@code trap}s
   * the given write {@code error}.
   */
  public static <I, O> Writer<I, O> error(Throwable error) {
    return new WriterError<I, O>(error);
  }
}

final class WriterDone<I, O> extends Writer<I, O> {
  private final O output;

  WriterDone(O output) {
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
  public Writer<I, O> pull(Output<?> output) {
    return this;
  }

  @Override
  public O bind() {
    return this.output;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <I2> Writer<I2, O> asDone() {
    return (Writer<I2, O>) this;
  }

  @Override
  public <O2> Writer<I, O2> andThen(Writer<I, O2> that) {
    return that;
  }
}

final class WriterError<I, O> extends Writer<I, O> {
  private final Throwable error;

  WriterError(Throwable error) {
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
  public Writer<I, O> pull(Output<?> output) {
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
  public <I2, O2> Writer<I2, O2> asError() {
    return (Writer<I2, O2>) this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <O2> Writer<I, O2> andThen(Writer<I, O2> that) {
    return (Writer<I, O2>) this;
  }
}

final class WriterAndThen<I, O> extends Writer<I, O> {
  private final Writer<I, ?> head;
  private final Writer<I, O> tail;

  WriterAndThen(Writer<I, ?> head, Writer<I, O> tail) {
    this.head = head;
    this.tail = tail;
  }

  @Override
  public Writer<I, O> pull(Output<?> output) {
    final Writer<I, ?> head = this.head.pull(output);
    if (head.isDone()) {
      return this.tail;
    } else if (head.isError()) {
      return head.asError();
    }
    return new WriterAndThen<I, O>(head, this.tail);
  }
}
