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
 * Continuation of how to decode subsequent input buffers from a byte stream.
 * {@code Decoder} enables efficient, interruptible decoding of network
 * protocols and data formats, without intermediate buffer copying.
 *
 * <h3>Decoder states</h3>
 * <p>A {@code Decoder} is always in one of three states: <em>cont</em>inue,
 * <em>done</em>, or <em>error</em>.  The <em>cont</em> state indicates that
 * {@link #feed(InputBuffer) feed} is ready to consume input buffer data; the
 * <em>done</em> state indicates that decoding terminated successfully, and that
 * {@link #bind() bind} will return the decoded result; the <em>error</em> state
 * indicates that decoding terminated in failure, and that {@link #trap() trap}
 * will return the decode error.  {@code Decoder} subclasses default to the
 * <em>cont</em> state.</p>
 *
 * <h3>Feeding input</h3>
 * <p>The {@link #feed(InputBuffer)} method incrementally decodes as much
 * {@code InputBuffer} data as it can, before returning another {@code Decoder}
 * that represents the continuation of how to decode additional {@code
 * InputBuffer} data.  The {@code InputBuffer} passed to {@code feed} is only
 * guaranteed to be valid for the duration of the method call; references to
 * the provided {@code InputBuffer} instance must not be stored.</p>
 *
 * <h3>Decoder results</h3>
 * <p>A {@code Decoder} produces a decoded result of type {@code O}, obtained
 * via the {@link #bind()} method.  {@code bind} is only guaranteed to return
 * a result when in the <em>done</em> state; though {@code bind} may optionally
 * make available partial results in other states.  A failed {@code Decoder}
 * provides a decode error via the {@link #trap()} method.  {@code trap} is
 * only guaranteed to return an error when in the <em>error</em> state.</p>
 *
 * <h3>Continuations</h3>
 * <p>A {@code Decoder} instance represents a continuation of how to decode
 * remaining {@code InputBuffer} data.  Rather than parsing a completely
 * buffered input in one go, a {@code Decoder} takes a buffered chunk and
 * returns another {@code Decoder} instance that knows how to decode subsequent
 * buffered chunks.  This enables non-blocking, incremental decoding that can
 * be interrupted whenever an {@code InputBuffer} runs out of immediately
 * available data.  A {@code Decoder} terminates by returning a continuation
 * in either the <em>done</em> state, or the <em>error</em> state. {@link
 * Decoder#done(Object)} returns a {@code Decoder} in the <em>done</em> state.
 * {@link Decoder#error(Throwable)} returns a {@code Decoder} in the
 * <em>error</em> state.</p>
 *
 * <h3>Immutability</h3>
 * <p>A {@code Decoder} should be immutable.  Specifically, an invocation of
 * {@code feed} should not alter the behavior of future calls to {@code feed}
 * on the same {@code Decoder} instance.  A {@code Decoder} should only mutate
 * its internal state if it's essential to do so, such as for critical path
 * performance reasons.</p>
 *
 * <h3>Forking</h3>
 * <p>The {@link #fork(Object)} method passes an out-of-band condition to a
 * {@code Decoder}, yielding a {@code Decoder} continuation whose behavior may
 * be altered by the given condition.  For example, a text {@code Decoder}
 * might support a {@code fork} condition to change the character encoding.
 * The types of conditions accepted by {@code fork}, and their intended
 * semantics, are implementation defined.</p>
 */
public abstract class Decoder<O> {
  /**
   * Returns {@code true} when {@link #feed(InputBuffer) feed} is able to
   * consume {@code InputBuffer} data.  i.e. this {@code Decoder} is in the
   * <em>cont</em> state.
   */
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when decoding has terminated successfully, and {@link
   * #bind() bind} will return the decoded result.  i.e. this {@code Decoder}
   * is in the <em>done</em> state.
   */
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when decoding has terminated in failure, and {@link
   * #trap() trap} will return the decode error.  i.e. this {@code Decoder} is
   * in the <em>error</em> state.
   */
  public boolean isError() {
    return false;
  }

  /**
   * Incrementally decodes as much {@code input} buffer data as possible, and
   * returns another {@code Decoder} that represents the continuation of how to
   * decode additional buffer data.  If {@code isLast} is {@code true}, then
   * {@code feed} <em>must</em> return a terminated {@code Decoder}, i.e. a
   * {@code Decoder} in the <em>done</em> state, or in the <em>error</em>
   * state. The given {@code input} buffer is only guaranteed to be valid for
   * the duration of the method call; references to {@code input} must not be
   * stored.
   */
  public abstract Decoder<O> feed(InputBuffer input);

  /**
   * Returns a {@code Decoder} continuation whose behavior may be altered by
   * the given out-of-band {@code condition}.
   */
  public Decoder<O> fork(Object condition) {
    return this;
  }

  /**
   * Returns the decoded result.  Only guaranteed to return a result when in
   * the <em>done</em> state.
   *
   * @throws IllegalStateException if this {@code Decoder} is not in the
   *         <em>done</em> state.
   */
  public O bind() {
    throw new IllegalStateException();
  }

  /**
   * Returns the decode error.  Only guaranteed to return an error when in the
   * <em>error</em> state.
   *
   * @throws IllegalStateException if this {@code Decoder} is not in the
   *         <em>error</em> state.
   */
  public Throwable trap() {
    throw new IllegalStateException();
  }

  /**
   * Casts an errored {@code Decoder} to a different output type.
   * A {@code Decoder} in the <em>error</em> state can have any output type.
   *
   * @throws IllegalStateException if this {@code Decoder} is not in the
   *         <em>error</em> state.
   */
  public <O> Decoder<O> asError() {
    throw new IllegalStateException();
  }

  private static Decoder<Object> done;

  /**
   * Returns a {@code Decoder} in the <em>done</em> state that {@code bind}s
   * a {@code null} decoded result.
   */
  @SuppressWarnings("unchecked")
  public static <O> Decoder<O> done() {
    if (done == null) {
      done = new DecoderDone<Object>(null);
    }
    return (Decoder<O>) done;
  }

  /**
   * Returns a {@code Decoder} in the <em>done</em> state that {@code bind}s
   * the given decoded {@code output}.
   */
  public static <O> Decoder<O> done(O output) {
    if (output == null) {
      return done();
    } else {
      return new DecoderDone<O>(output);
    }
  }

  /**
   * Returns a {@code Decoder} in the <em>error</em> state that {@code trap}s
   * the given decode {@code error}.
   */
  public static <O> Decoder<O> error(Throwable error) {
    return new DecoderError<O>(error);
  }
}

final class DecoderDone<O> extends Decoder<O> {
  private final O output;

  DecoderDone(O output) {
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
  public Decoder<O> feed(InputBuffer input) {
    return this;
  }

  @Override
  public O bind() {
    return this.output;
  }
}

final class DecoderError<O> extends Decoder<O> {
  private final Throwable error;

  DecoderError(Throwable error) {
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
  public Decoder<O> feed(InputBuffer input) {
    return this;
  }

  @Override
  public Throwable trap() {
    return this.error;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <O> Decoder<O> asError() {
    return (Decoder<O>) this;
  }
}
