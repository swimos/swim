// Copyright 2015-2022 Swim.inc
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

import java.util.function.Supplier;
import swim.annotations.CheckReturnValue;
import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * An object representing how to continue encoding to future {@linkplain
 * OutputBuffer output buffers}. {@code Encode} enables efficient,
 * interruptible encoding of network protocols and data formats, without
 * intermediate buffer copying.
 *
 * <h3>Encode states</h3>
 * <p>
 * {@code Encode} is always in one of three states: <em>cont</em>inue,
 * <em>done</em>, or <em>error</em>. The <em>cont</em> state indicates that
 * encoding is ready to {@linkplain #produce(OutputBuffer) produce} more
 * output; the <em>done</em> state indicates that encoding completed
 * successfully, and that the {@link #get()} method will return the encode
 * result; the <em>error</em> state indicates that encoding failed, and that
 * the {@link #getError()} method will return the encode exception.
 * {@code Encode} subclasses default to the <em>cont</em> state.
 *
 * <h3>Producing output</h3>
 * <p>
 * The {@link #produce(OutputBuffer)} method incrementally encodes as much
 * {@code OutputBuffer} data as it can before returning a new {@code Encode}
 * instance that represents the continuation of how to encode future
 * {@code OutputBuffer} data. The {@code OutputBuffer} passed to {@code produce}
 * is only guaranteed to be valid for the duration of the method call;
 * references to the provided {@code OutputBuffer} should not be retained.
 *
 * <h3>Encode results</h3>
 * <p>
 * A successful encode sequence yields an encode result of type {@code T},
 * which can be obtained by calling the {@link #get()} method. {@code get} is
 * only guaranteed to return a result when in the <em>done</em> state; though
 * subclasses may optionally return partial results in other states. A failed
 * encode wraps a write error, which can be obtained by calling the
 * {@link #getError()} method. {@code getError} is only guaranteed to return
 * an error when in the <em>error</em> state.
 *
 * <h3>Continuations</h3>
 * <p>
 * {@code Encode} instances represent a continuation of how to encode future
 * {@code OutputBuffer} data. Rather than encoding complete output to a
 * growable buffer in one go, {@code Encode} encodes one chunk at a time,
 * returning a new {@code Encode} instance after each produced chunk that
 * knows how to encode future chunks. This approach enables non-blocking,
 * incremental encoding that can be interrupted whenever an {@code OutputBuffer}
 * runs out of immediately available space. Encoding terminates when an
 * {@code Encode} instance is returned in either the <em>done</em> state
 * or the <em>error</em> state. {@link Encode#done(Object)} returns an
 * {@code Encode} instance in the <em>done</em> state.
 * {@link Encode#error(Throwable)} returns an {@code Encode} instance
 * in the <em>error</em> state.
 */
@Public
@Since("5.0")
public abstract class Encode<T> {

  protected Encode() {
    // nop
  }

  /**
   * Returns {@code true} when in the <em>cont</em> state and able to
   * {@linkplain #produce(OutputBuffer) produce} more output.
   */
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when in the <em>done</em> state; future calls to
   * {@link #get()} will return the encode result.
   */
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when in the <em>error</em> state; future calls to
   * {@link #getError()} will return the encode error.
   */
  public boolean isError() {
    return false;
  }

  /**
   * Incrementally encodes as much {@code output} buffer data as possible
   * before returning a new {@code Encode} instance that represents the
   * continuation of how to encode future {@code OutputBuffer} data. If
   * {@link OutputBuffer#isLast() isLast} is {@code true}, then {@code produce}
   * <em>must</em> return a terminated {@code Encode} instance in either the
   * <em>done</em> state or the <em>error</em> state. The given {@code output}
   * buffer is only guaranteed to be valid for the duration of the method call;
   * references to {@code output} should not be retained.
   */
  public abstract Encode<T> produce(OutputBuffer<?> output);

  /**
   * Provides an opportunity for the {@code Encode} instance to propagate
   * backpressure to the caller. Returns {@code true} if the {@code Encode}
   * instance will invoke {@link OutputFuture#requestOutput() future.requestOutput()}
   * when it's ready to produce more output; otherwise returns {@code false}
   * if the {@code Encode} instance is currently ready to produce more output.
   */
  public boolean backoff(OutputFuture future) {
    return false;
  }

  /**
   * Returns the encode result, if in the <em>done</em> state.
   * Subclasses may optionally return a result in other states.
   *
   * @throws EncodeException with the encode error as its cause,
   *         if in the <em>error</em> state.
   * @throws IllegalStateException if in neither the <em>done</em> state
   *         nor the <em>error</em> state.
   */
  @CheckReturnValue
  public @Nullable T get() {
    throw new IllegalStateException("Incomplete encode");
  }

  /**
   * Returns the encode result, if in the <em>done</em> state and the result
   * is non-{@code null}.
   *
   * @throws EncodeException with the encode error as its cause,
   *         if in the <em>error</em> state.
   * @throws NullPointerException if the encode result is {@code null}.
   * @throws IllegalStateException if in neither the <em>done</em> state
   *         nor the <em>error</em> state.
   */
  @CheckReturnValue
  public @NonNull T getNonNull() {
    if (this.isDone()) {
      final T value = this.get();
      if (value != null) {
        return value;
      } else {
        throw new NullPointerException("Null encode result");
      }
    } else if (this.isError()) {
      throw new EncodeException("Encode failed", this.getError());
    } else {
      throw new IllegalStateException("Incomplete encode");
    }
  }

  /**
   * Returns the encode result, if in the <em>done</em> state and the result
   * is non-{@code null}; otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  public @NonNull T getOrNonNull(@NonNull T other) {
    if (this.isDone()) {
      final T value = this.get();
      if (value != null) {
        return value;
      }
    }
    return other;
  }

  /**
   * Returns the encode result, if in the <em>done</em> state;
   * otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  public @Nullable T getOr(@Nullable T other) {
    if (this.isDone()) {
      return this.get();
    } else {
      return other;
    }
  }

  /**
   * Returns the encode result, if in the <em>done</em> state; otherwise
   * returns the value produced by the given {@code supplier} function.
   */
  @CheckReturnValue
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    if (this.isDone()) {
      return this.get();
    } else {
      return supplier.get();
    }
  }

  /**
   * Returns the encode error, if in the <em>error</em> state;
   * otherwise throws {@link IllegalStateException}.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  @CheckReturnValue
  public Throwable getError() {
    throw new IllegalStateException("No encode error");
  }

  /**
   * Casts this {@code Encode} to a different result type, if in the
   * <em>error</em> state; otherwise throws {@link IllegalStateException}.
   * Encodes in the <em>error</em> state are bi-variant with respect to the
   * result type since they never return an encode result.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  public <T2> Encode<T2> asError() {
    throw new IllegalStateException("No encode error");
  }

  /**
   * Throws an {@link EncodeException} with the encode error as its cause,
   * if in the <em>error</em> state; otherwise does nothing.
   *
   * @throws EncodeException with the encode error as its cause,
   *         if in the <em>error</em> state.
   */
  public void checkError() {
    if (this.isError()) {
      throw new EncodeException("Encode failed", this.getError());
    }
  }

  /**
   * Throws an {@link EncodeException} if not in the <em>done</em> state;
   * otherwise does nothing. If in the <em>error</em> state, the encode error
   * will be included as the cause of the thrown {@code EncodeException}.
   *
   * @throws EncodeException if not in the <em>done</em> state.
   */
  public void checkDone() {
    if (this.isError()) {
      throw new EncodeException("Encode failed", this.getError());
    } else if (!this.isDone()) {
      throw new EncodeException("Incomplete encode");
    }
  }

  /**
   * Returns a {@code Encode} instance that continues encoding {@code that}
   * after it finishes encoding {@code this}.
   */
  public <T2> Encode<T2> andThen(Encode<T2> that) {
    return new EncodeAndThen<T2>(this, that);
  }

  private static final Encode<Object> DONE = new EncodeDone<Object>(null);

  /**
   * Returns an {@code Encode} instance in the <em>done</em> state that wraps
   * a {@code null} encode result.
   */
  @CheckReturnValue
  public static <T> Encode<T> done() {
    return Assume.conforms(DONE);
  }

  /**
   * Returns an {@code Encode} instance in the <em>done</em> state that wraps
   * the given encode {@code result}.
   */
  @CheckReturnValue
  public static <T> Encode<T> done(@Nullable T result) {
    if (result == null) {
      return Encode.done();
    } else {
      return new EncodeDone<T>(result);
    }
  }

  /**
   * Returns an {@code Encode} instance in the <em>error</em> state that wraps
   * the given encode {@code error}.
   */
  @CheckReturnValue
  public static <T> Encode<T> error(Throwable error) {
    return new EncodeError<T>(error);
  }

}

final class EncodeDone<T> extends Encode<T> implements ToSource {

  private final @Nullable T result;

  EncodeDone(@Nullable T result) {
    this.result = result;
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
  public Encode<T> produce(OutputBuffer<?> result) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    return this.result;
  }

  @Override
  public <T2> Encode<T2> andThen(Encode<T2> that) {
    return that;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Encode", "done");
    if (this.result != null) {
      notation.appendArgument(this.result);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class EncodeError<T> extends Encode<T> implements ToSource {

  private final Throwable error;

  EncodeError(Throwable error) {
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
  public Encode<T> produce(OutputBuffer<?> output) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    throw new EncodeException("Encode failed", this.error);
  }

  @Override
  public Throwable getError() {
    return this.error;
  }

  @Override
  public <T2> Encode<T2> asError() {
    return Assume.conforms(this);
  }

  @Override
  public <T2> Encode<T2> andThen(Encode<T2> that) {
    return Assume.conforms(this);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Encode", "error")
            .appendArgument(this.error)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class EncodeAndThen<T> extends Encode<T> implements ToSource {

  private final Encode<?> head;
  private final Encode<T> tail;

  EncodeAndThen(Encode<?> head, Encode<T> tail) {
    this.head = head;
    this.tail = tail;
  }

  @Override
  public Encode<T> produce(OutputBuffer<?> output) {
    Encode<?> head = this.head;
    if (head.isCont()) {
      head = head.produce(output);
    }
    if (head.isDone()) {
      return this.tail;
    } else if (head.isError()) {
      return head.asError();
    } else {
      return new EncodeAndThen<T>(head, this.tail);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.head)
            .beginInvoke("andThen")
            .appendArgument(this.tail)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
