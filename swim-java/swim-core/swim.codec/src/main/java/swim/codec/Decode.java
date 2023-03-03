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
import swim.util.Result;
import swim.util.ToSource;

/**
 * An object representing how to continue decoding from future {@linkplain
 * InputBuffer input buffers}. {@code Decode} enables efficient,
 * interruptible decoding of network protocols and data formats,
 * without intermediate buffer copying.
 *
 * <h3>Decode states</h3>
 * <p>
 * {@code Decode} is always in one of three states: <em>cont</em>inue,
 * <em>done</em>, or <em>error</em>. The <em>cont</em> state indicates that
 * decoding is ready to {@linkplain #consume(InputBuffer) consume} more input;
 * the <em>done</em> state indicates that decoding completed successfully,
 * and that the {@link #get()} method will return the decode result;
 * the <em>error</em> state indicates that decoding failed, and that the
 * {@link #getError()} method will return the decode exception.
 * {@code Decode} subclasses default to the <em>cont</em> state.
 *
 * <h3>Consuming input</h3>
 * <p>
 * The {@link #consume(InputBuffer)} method incrementally decodes as much
 * {@code InputBuffer} data as it can before returning a new {@code Decode}
 * instance that represents the continuation of how to decode future
 * {@code InputBuffer} data. The {@code InputBuffer} passed to {@code consume}
 * is only guaranteed to be valid for the duration of the method call;
 * references to the provided {@code InputBuffer} should not be retained.
 *
 * <h3>Decode results</h3>
 * <p>
 * A successful decode sequence yields a decode result of type {@code T},
 * which can be obtained by calling the {@link #get()} method. {@code get} is
 * only guaranteed to return a result when in the <em>done</em> state; though
 * subclasses may optionally return partial results in other states. A failed
 * decode wraps a decoding error, which can be obtained by calling the
 * {@link #getError()} method. {@code getError} is only guaranteed to return
 * an error when in the <em>error</em> state.
 *
 * <h3>Continuations</h3>
 * <p>
 * {@code Decode} instances represent a continuation of how to decode future
 * {@code InputBuffer} data. Rather than decoding fully buffered input in
 * one go, {@code Decode} decodes one chunk at a time, returning a new
 * {@code Decode} instance after each consumed chunk that knows how to decode
 * future chunks. This approach enables non-blocking, incremental decoding that
 * can be interrupted whenever an {@code InputBuffer} runs out of immediately
 * available data. Decoding terminates when a {@code Decode} instance is
 * returned in either the <em>done</em> state or the <em>error</em> state.
 * {@link Decode#done(Object)} returns a {@code Decode} instance in the
 * <em>done</em> state. {@link Decode#error(Throwable)} returns a
 * {@code Decode} instance in the <em>error</em> state.
 *
 * <h3>Immutability</h3>
 * <p>
 * {@code Decode} instances should be immutable, when possible. Specifically,
 * an invocation of {@code consume} should not alter the behavior of future
 * calls to {@code consume} on the same {@code Decode} instance. {@code Decode}
 * should only mutate its internal state when it's essential to do so, such as
 * for critical performance optimizations.
 */
@Public
@Since("5.0")
public abstract class Decode<T> {

  protected Decode() {
    // nop
  }

  /**
   * Returns {@code true} when in the <em>cont</em> state and able to
   * {@linkplain #consume(InputBuffer) consume} more input.
   */
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when in the <em>done</em> state; future calls to
   * {@link #get()} will return the decode result.
   */
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when in the <em>error</em> state; future calls to
   * {@link #getError()} will return the decode error.
   */
  public boolean isError() {
    return false;
  }

  /**
   * Incrementally decodes as much {@code input} buffer data as possible before
   * returning a new {@code Decode} instance that represents the continuation
   * of how to decode future {@code InputBuffer} data. If {@link InputBuffer#isLast()
   * input.isLast()} is {@code true}, then {@code consume} <em>must</em> return
   * a terminated {@code Decode} instance in either the <em>done</em> state
   * or the <em>error</em> state. The given {@code input} buffer is only
   * guaranteed to be valid for the duration of the method call; references
   * to {@code input} should not be retained.
   */
  public abstract Decode<T> consume(InputBuffer input);

  /**
   * Provides an opportunity for the {@code Decode} instance to propagate
   * backpressure to the caller. Returns {@code true} if the {@code Decode}
   * instance will invoke {@link InputFuture#requestInput() future.requestInput()}
   * when it's ready to consume more input; otherwise returns {@code false}
   * if the {@code Decode} instance is currently ready to consume more input.
   */
  public boolean backoff(InputFuture future) {
    return false;
  }

  /**
   * Returns the decode result, if in the <em>done</em> state.
   * Subclasses may optionally return a result in other states.
   *
   * @throws DecodeException with the decode error as its cause,
   *         if in the <em>error</em> state.
   * @throws IllegalStateException if in neither the <em>done</em> state
   *         nor the <em>error</em> state.
   */
  @CheckReturnValue
  public @Nullable T get() {
    throw new IllegalStateException("Incomplete decode");
  }

  /**
   * Returns the decode result, if in the <em>done</em> state and the result
   * is non-{@code null}.
   *
   * @throws DecodeException with the decode error as its cause,
   *         if in the <em>error</em> state.
   * @throws NullPointerException if the decode result is {@code null}.
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
        throw new NullPointerException("Null decode result");
      }
    } else if (this.isError()) {
      throw new DecodeException("Decode failed", this.getError());
    } else {
      throw new IllegalStateException("Incomplete decode");
    }
  }

  /**
   * Returns the decode result, if in the <em>done</em> state;
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
   * Returns the decode result, if in the <em>done</em> state and the result
   * is non-{@code null}; otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  public @NonNull T getNonNullOr(@NonNull T other) {
    if (this.isDone()) {
      final T value = this.get();
      if (value != null) {
        return value;
      }
    }
    return other;
  }

  /**
   * Returns the decode result, if in the <em>done</em> state; otherwise
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
   * Returns the decode error, if in the <em>error</em> state;
   * otherwise throws {@link IllegalStateException}.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  @CheckReturnValue
  public Throwable getError() {
    throw new IllegalStateException("No decode error");
  }

  /**
   * Casts this {@code Decode} to a different result type if in the
   * <em>error</em> state; otherwise throws {@link IllegalStateException}.
   * Decodes in the <em>error</em> state are bi-variant with respect to the
   * result type since they never return a decode result.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  public <T2> Decode<T2> asError() {
    throw new IllegalStateException("No decode error");
  }

  /**
   * Throws a {@link DecodeException} with the decode error as its cause,
   * if in the <em>error</em> state; otherwise returns {@code this}.
   *
   * @throws DecodeException with the decode error as its cause,
   *         if in the <em>error</em> state.
   */
  public Decode<T> checkError() {
    if (this.isError()) {
      throw new DecodeException("Decode failed", this.getError());
    } else {
      return this;
    }
  }

  /**
   * Throws a {@link DecodeException} if not in the <em>done</em> state;
   * otherwise returns {@code this}. If in the <em>error</em> state,
   * the decode error will be included as the cause of the thrown
   * {@code DecodeException}.
   *
   * @throws DecodeException if not in the <em>done</em> state.
   */
  public Decode<T> checkDone() {
    if (this.isDone()) {
      return this;
    } else if (this.isError()) {
      throw new DecodeException("Decode failed", this.getError());
    } else {
      throw new DecodeException("Incomplete decode");
    }
  }

  public Result<T> toResult() {
    try {
      return Result.ok(this.get());
    } catch (Throwable error) {
      if (Result.isNonFatal(error)) {
        return Result.error(error);
      } else {
        throw error;
      }
    }
  }

  private static final Decode<Object> DONE = new DecodeDone<Object>(null);

  /**
   * Returns a {@code Decode} instance in the <em>done</em> state that wraps
   * a {@code null} decode result.
   */
  @CheckReturnValue
  public static <T> Decode<T> done() {
    return Assume.conforms(DONE);
  }

  /**
   * Returns a {@code Decode} instance in the <em>done</em> state that wraps
   * the given decode {@code result}.
   */
  @CheckReturnValue
  public static <T> Decode<T> done(@Nullable T result) {
    if (result == null) {
      return Decode.done();
    } else {
      return new DecodeDone<T>(result);
    }
  }

  /**
   * Returns a {@code Decode} instance in the <em>error</em> state that wraps
   * the given decode {@code error}.
   */
  @CheckReturnValue
  public static <T> Decode<T> error(Throwable error) {
    return new DecodeError<T>(error);
  }

}

final class DecodeDone<T> extends Decode<T> implements ToSource {

  final @Nullable T value;

  DecodeDone(@Nullable T value) {
    this.value = value;
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
  public Decode<T> consume(InputBuffer input) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    return this.value;
  }

  @Override
  public Result<T> toResult() {
    return Result.ok(this.value);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Decode", "done");
    if (this.value != null) {
      notation.appendArgument(this.value);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class DecodeError<T> extends Decode<T> implements ToSource {

  final Throwable error;

  DecodeError(Throwable error) {
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
  public Decode<T> consume(InputBuffer input) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    throw new DecodeException("Decode failed", this.error);
  }

  @Override
  public Throwable getError() {
    return this.error;
  }

  @Override
  public <T2> Decode<T2> asError() {
    return Assume.conforms(this);
  }

  @Override
  public Result<T> toResult() {
    return Result.error(this.error);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Decode", "error")
            .appendArgument(this.error)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
