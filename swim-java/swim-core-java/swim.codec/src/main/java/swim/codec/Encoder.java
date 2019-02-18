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
 * Continuation of how encode subsequent output buffers for a byte stream.
 * {@code Encoder} enables efficient, interruptible encoding of network
 * protocols and data formats, without intermediate buffer copying.
 *
 * <h3>Encoder states</h3>
 * <p>An {@code Encoder} is always in one of three states: <em>cont</em>inue,
 * <em>done</em>, or <em>error</em>.  The <em>cont</em> state indicates that
 * {@link #pull(OutputBuffer) pull} is ready to produce buffer data; the
 * <em>done</em> state indicates that encoding terminated successfully, and that
 * {@link #bind() bind} will return the encoded result; the <em>error</em>
 * state indicates that encoding terminated in failure, and that {@link #trap()
 * trap} will return the encode error.  {@code Encoder} subclasses default to
 * the <em>cont</em> state.</p>
 *
 * <h3>Feeding input</h3>
 * <p>The {@link #feed(Object) feed(I)} method returns an {@code Encoder} that
 * represents the continuation of how to encode the given input object to
 * subsequent output buffers.  {@code feed} can be used to specify an initial
 * object to encode, or to change the object to be encoded.</p>
 *
 * <h3>Pulling output</h3>
 * <p>The {@link #pull(OutputBuffer)} method incrementally encodes as much
 * buffer data as it can, before returning another {@code Encoder} that
 * represents the continuation of how to encoded additional buffer data.
 * The buffer passed to {@code pull} is only guaranteed to be valid for the
 * duration of the method call; references to the provided buffer must not be
 * stored.</p>
 *
 * <h3>Encoder results</h3>
 * <p>An {@code Encoder} produces an encoded result of type {@code O}, obtained
 * via the {@link #bind()} method.  {@code bind} is only guaranteed to return a
 * result when in the <em>done</em> state; though {@code bind} may optionally
 * make available partial results in other states.  A failed {@code Encoder}
 * provides a write error via the {@link #trap()} method.  {@code trap} is only
 * guaranteed to return an error when in the <em>error</em> state.</p>
 *
 * <h3>Continuations</h3>
 * <p>An {@code Encoder} instance represents a continuation of how to encode
 * remaining buffer data.  Rather than encoding a completely buffered output in
 * one go, an {@code Encoder} takes a buffer chunk and returns another {@code
 * Encoder} instance that knows how to write subsequent buffer chunks.
 * This enables non-blocking, incremental encoding that can be interrupted
 * whenever an output buffer runs out of space.  An {@code Encoder} terminates
 * by returning a continuation in either the <em>done</em> state, or the
 * <em>error</em> state.  {@link Encoder#done(Object)} returns an {@code
 * Encoder} in the <em>done</em> state.  {@link Encoder#error(Throwable)}
 * returns an {@code Encoder} in the <em>error</em> state.</p>
 *
 * <h3>Forking</h3>
 * <p>The {@link #fork(Object)} method passes an out-of-band condition to an
 * {@code Encoder}, yielding an {@code Encoder} continuation whose behavior may
 * be altered by the given condition.  For example, a text {@code Encoder}
 * might support a {@code fork} condition to change the character encoding.
 * The types of conditions accepted by {@code fork}, and their intended
 * semantics, are implementation defined.</p>
 */
public abstract class Encoder<I, O> {
  /**
   * Returns {@code true} when {@link #pull(OutputBuffer) pull} is able to
   * produce buffer data.  i.e. this {@code Encoder} is in the <em>cont</em>
   * state.
   */
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when encoding has terminated successfully, and {@link
   * #bind() bind} will return the encoded result.  i.e. this {@code Encoder} is
   * in the <em>done</em> state.
   */
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when encoding has terminated in failure, and {@link
   * #trap() trap} will return the encode error.  i.e. this {@code Encoder} is
   * in the <em>error</em> state.
   */
  public boolean isError() {
    return false;
  }

  /**
   * Returns an {@code Encoder} that represents the continuation of how to
   * encode the given {@code input} object.
   *
   * @throws IllegalArgumentException if this {@code Encoder} does not know how
   *         to encode the given {@code input} object.
   */
  public Encoder<I, O> feed(I input) {
    throw new IllegalStateException();
  }

  /**
   * Incrementally encodes as much {@code output} buffer data as possible, and
   * returns another {@code Encoder} that represents the continuation of how to
   * write additional buffer data.  If {@code isLast} is {@code true}, then
   * {@code pull} <em>must</em> return a terminated {@code Encoder}, i.e. an
   * {@code Encoder} in the <em>done</em> state, or in the <em>error</em> state.
   * The given {@code output} buffer is only guaranteed to be valid for the
   * duration of the method call; references to {@code output} must not be
   * stored.
   */
  public abstract Encoder<I, O> pull(OutputBuffer<?> output);

  /**
   * Returns an {@code Encoder} continuation whose behavior may be altered by
   * the given out-of-band {@code condition}.
   */
  public Encoder<I, O> fork(Object condition) {
    return this;
  }

  /**
   * Returns the encoded result.  Only guaranteed to return a result when in
   * the <em>done</em> state.
   *
   * @throws IllegalStateException if this {@code Encoder} is not in the
   *         <em>done</em> state.
   */
  public O bind() {
    return null;
  }

  /**
   * Returns the encode error.  Only guaranteed to return an error when in the
   * <em>error</em> state.
   *
   * @throws IllegalStateException if this {@code Encoder} is not in the
   *         <em>error</em> state.
   */
  public Throwable trap() {
    throw new IllegalStateException();
  }

  /**
   * Casts a done {@code Encoder} to a different input type.
   * An {@code Encoder} in the <em>done</em> state can have any input type.
   *
   * @throws IllegalStateException if this {@code Encoder} is not in the
   *         <em>done</em> state.
   */
  public <I2> Encoder<I2, O> asDone() {
    throw new IllegalStateException();
  }

  /**
   * Casts an errored {@code Encoder} to different input and output types.
   * An {@code Encoder} in the <em>error</em> state can have any input type,
   * and any output type.
   *
   * @throws IllegalStateException if this {@code Encoder} is not in the
   *         <em>error</em> state.
   */
  public <I2, O2> Encoder<I2, O2> asError() {
    throw new IllegalStateException();
  }

  /**
   * Returns an {@code Encoder} that continues encoding {@code that} {@code
   * Encoder}, after it finishes encoding {@code this} {@code Encoder}.
   */
  public <O2> Encoder<I, O2> andThen(Encoder<I, O2> that) {
    return new EncoderAndThen<I, O2>(this, that);
  }

  private static Encoder<Object, Object> done;

  /**
   * Returns an {@code Encoder} in the <em>done</em> state that {@code bind}s
   * a {@code null} encoded result.
   */
  @SuppressWarnings("unchecked")
  public static <I, O> Encoder<I, O> done() {
    if (done == null) {
      done = new EncoderDone<Object, Object>(null);
    }
    return (Encoder<I, O>) done;
  }

  /**
   * Returns an {@code Encoder} in the <em>done</em> state that {@code bind}s
   * the given encoded {@code output}.
   */
  public static <I, O> Encoder<I, O> done(O output) {
    if (output == null) {
      return done();
    } else {
      return new EncoderDone<I, O>(output);
    }
  }

  /**
   * Returns an {@code Encoder} in the <em>error</em> state that {@code trap}s
   * the given encode {@code error}.
   */
  public static <I, O> Encoder<I, O> error(Throwable error) {
    return new EncoderError<I, O>(error);
  }
}

final class EncoderDone<I, O> extends Encoder<I, O> {
  private final O output;

  EncoderDone(O output) {
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
  public Encoder<I, O> pull(OutputBuffer<?> output) {
    return this;
  }

  @Override
  public O bind() {
    return this.output;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <I2> Encoder<I2, O> asDone() {
    return (Encoder<I2, O>) this;
  }

  @Override
  public <O2> Encoder<I, O2> andThen(Encoder<I, O2> that) {
    return that;
  }
}

final class EncoderError<I, O> extends Encoder<I, O> {
  private final Throwable error;

  EncoderError(Throwable error) {
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
  public Encoder<I, O> pull(OutputBuffer<?> output) {
    return this;
  }

  @Override
  public Throwable trap() {
    return this.error;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <I2, O2> Encoder<I2, O2> asError() {
    return (Encoder<I2, O2>) this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <O2> Encoder<I, O2> andThen(Encoder<I, O2> that) {
    return (Encoder<I, O2>) this;
  }
}

final class EncoderAndThen<I, O> extends Encoder<I, O> {
  private final Encoder<I, ?> head;
  private final Encoder<I, O> tail;

  EncoderAndThen(Encoder<I, ?> head, Encoder<I, O> tail) {
    this.head = head;
    this.tail = tail;
  }

  @Override
  public Encoder<I, O> pull(OutputBuffer<?> output) {
    Encoder<I, ?> head = this.head;
    if (head.isCont()) {
      head = head.pull(output);
    }
    if (head.isDone()) {
      return this.tail;
    } else if (head.isError()) {
      return head.asError();
    } else {
      return new EncoderAndThen<I, O>(head, this.tail);
    }
  }
}
