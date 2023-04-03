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

import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.function.Supplier;
import swim.annotations.CheckReturnValue;
import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.Result;
import swim.util.ToSource;

/**
 * The state of an interruptible encode operation. An {@code Encode} instance
 * {@linkplain #produce(OutputBuffer) produces} an {@linkplain OutputBuffer
 * output buffer} chunk, returning a new {@code Encode} instance representing
 * the continuation of the encode operation. Encoding continues chunk by chunk
 * until an {@code Encode} instance in a terminal state is reached. This
 * approach enables efficient, interruptible encoding of composite network
 * protocols and data formats without blocking or intermediate buffering.
 *
 * <h2>Encode states</h2>
 * <p>
 * An {@code Encode} instance is always in one—and only one—of the following
 * three <em>encode states</em>:
 * <ul>
 * <li>{@link #isCont() encode-cont}: the encode operation is ready
 *     to {@linkplain #produce(OutputBuffer) produce} more output
 * <li>{@link #isDone() encode-done}: the encode operation terminated
 *     with a {@linkplain #get() encoded value}
 * <li>{@link #isError() encode-error}: the encode operation terminated
 *     with a {@linkplain #getError() encode error}
 * </ul>
 * <p>
 * {@code Encode} subclasses default to the {@code encode-cont} state.
 * {@link Encode#done(Object) Encode.done(T)} returns an instance in the
 * {@code encode-done} state. {@link Encode#error(Throwable)} returns an
 * instance in the {@code encode-error} state.
 *
 * <h2>Producing output</h2>
 * <p>
 * The {@link #produce(OutputBuffer)} method encodes a single output chunk
 * and returns a new {@code Encode} instance representing the updated state
 * of the encode operation. Any returned {@code Encode} instance in the
 * {@code encode-cont} state should eventually be called to {@code produce}
 * an additional output chunk. If the end of output is reached, {@code produce}
 * should be called with output in the {@link OutputBuffer#isDone() output-done}
 * state. The encode operation terminates when {@code produce} returns an
 * {@code Encode} instance in either the {@code encode-done} state or the
 * {@code encode-error} state.
 *
 * <h2>Encode results</h2>
 * <p>
 * A successful encode operation wraps an <em>encoded value</em> of type
 * {@code T}, which can be obtained by calling a member of the {@code get}
 * family of methods:
 * <ul>
 * <li>{@link #get()}: returns the encoded value, if available;
 *     otherwise throws an exception
 * <li>{@link #getNonNull()}: returns the encoded value, if available
 *     and not {@code null}; otherwise throws an exception
 * <li>{@link #getUnchecked()}: returns the encoded value, if available;
 *     otherwise throws an unchecked exception
 * <li>{@link #getNonNullUnchecked()}: returns the encoded value, if available
 *     and not {@code null}; otherwise throws an unchecked exception
 * <li>{@link #getOr(Object) getOr(T)}: returns the encoded value, if available;
 *     otherwise returns a default value
 * <li>{@link #getNonNullOr(Object) getNonNullOr(T)}: returns the encoded value,
 *     if available and not {@code null}; otherwise returns a default value
 * <li>{@link #getOrElse(Supplier)}: returns the encoded value, if available;
 *     otherwise returns a value supplied by a function
 * <li>{@link #getNonNullOrElse(Supplier)}: returns the encoded value,
 *     if available and not {@code null}, otherwise returns a value
 *     supplied by a function
 * </ul>
 * <p>
 * A failed encode operation wraps a throwable <em>encode error</em>,
 * which can be obtained by calling the {@link #getError()} method.
 *
 * <h2>Backpressure propagation</h2>
 * <p>
 * {@code Encode} subclasses can optionally propagate backpressure by
 * overriding the {@link #backoff(OutputFuture)} method. Backpressure-aware
 * encoders invoke {@code backoff} with an {@code OutputFuture} after every
 * call to {@code produce}. If {@code backoff} returns {@code true}, the
 * encoder will not invoke {@code produce} again until the {@code Encode}
 * instance calls {@link OutputFuture#requestOutput()}. Returning {@code false}
 * from {@code backoff} indicates that the {@code Encode} instance is currently
 * ready to produce more output.
 *
 * <h2>Encode continuations</h2>
 * <p>
 * Think of an {@code Encode} instance in the {@code encode-cont} state as
 * capturing the call stack of an encode operation at the point where it ran
 * out of available output capacity. When {@code produce} is subsequently
 * called with new output capacity, the call stack is reconstructed, and
 * encoding continues where it left off. The stack is captured by returning
 * an {@code Encode} instance containing the state of each encode frame as the
 * stack unwinds. The stack is restored by invoking {@code produce} on any
 * nested @code Encode} instances that were captured when the encode operation
 * was previously interrupted.
 *
 * @see OutputBuffer
 * @see Encoder
 */
@Public
@Since("5.0")
public abstract class Encode<T> {

  /**
   * Constructs an {@code Encode} instance in the {@code encode-cont} state.
   */
  protected Encode() {
    // nop
  }

  /**
   * Returns {@code true} when in the {@code encode-cont} state,
   * ready to {@linkplain #produce(OutputBuffer) produce} more output.
   *
   * @return whether or not this {@code Encode} instance is
   *         in the {@code encode-cont} state
   */
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when in the {@code encode-done} state,
   * having terminated with an {@linkplain #get() encoded value}.
   *
   * @return whether or not this {@code Encode} instance is
   *         in the {@code encode-done} state
   */
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when in the {@code encode-error} state,
   * having terminated with an {@linkplain #getError() encode error}.
   *
   * @return whether or not this {@code Encode} instance is
   *         in the {@code encode-error} state
   */
  public boolean isError() {
    return false;
  }

  /**
   * Encodes an {@code output} chunk and returns a new {@code Encode} instance
   * representing the updated state of the encode operation. If the output
   * enters the {@link OutputBuffer#isDone() output-done} state, then
   * {@code produce} <em>must</em> return a terminated {@code Encode} instance
   * in either the {@code encode-done} state or the {@code encode-error} state.
   * The given {@code output} is only guaranteed to be valid for the duration
   * of the method call; references to {@code output} should not be retained.
   *
   * @param output the output buffer in which to encode an output chunk
   * @return the continuation of the encode operation
   */
  public abstract Encode<T> produce(OutputBuffer<?> output);

  /**
   * Provides an opportunity for the {@code Encode} instance to propagate
   * backpressure to the caller. Returns {@code true} if the {@code Encode}
   * instance will invoke {@link OutputFuture#requestOutput() future.requestOutput()}
   * when it's ready to produce more output; otherwise returns {@code false}
   * if the {@code Encode} instance is currently ready to produce more output.
   * The default implementation returns {@code false}.
   * <p>
   * After {@code backoff} returns {@code true}, but before {@code
   * future.requestOutput()} is called, the {@code Encode} instance enters the
   * implicit {@code encode-backoff} state. Once in the {@code encode-backoff}
   * state, it is responsibility of the {@code Encode} instance to ensure that
   * {@code future.requestOutput()} eventually gets called.
   * <p>
   * Encode backoff is advisory. An encoder may invoke {@code produce}
   * at any time. Even backpressure-aware encoders may disregard the
   * {@code encode-backoff} state and invoke {@code produce} with a
   * terminated output in order to terminate an encode operation.
   * <p>
   * Consider the example of a proxy transcoder that decodes one input,
   * and encodes another output. There's no point invoking {@code produce}
   * on the encode end of the transcoder if the decode end's input is empty.
   * Such a transcoder can wait for input to become available before calling
   * {@code future.requestOutput()}.
   *
   * @param future an output future that will trigger an invocation of
   *        {@code produce} after its {@code requestOutput} method is called
   * @return whether or not the encoder should wait to invoke {@code produce}
   *         until after {@code future.requestOutput()} is called
   */
  public boolean backoff(OutputFuture future) {
    return false;
  }

  /**
   * Returns the encoded value, if in the {@code encode-done} state;
   * otherwise throws an exception. Subclasses may optionally return
   * a value in other states.
   *
   * @return the encoded value, if available
   * @throws EncodeException if in the {@code encode-error} state
   * @throws IllegalStateException if in the {@code encode-cont} state
   */
  @CheckReturnValue
  public @Nullable T get() throws EncodeException {
    throw new IllegalStateException("incomplete encode");
  }

  /**
   * Returns the encoded value, if in the {@code encode-done} state and
   * the encoded value is not {@code null}; otherwise throws an exception.
   * Subclasses may optionally return a non-{@code null} value in other states.
   * The default implementation delegates to {@link #get()},
   * {@code null}-checking its return value.
   *
   * @return the encoded value, if available and not {@code null}
   * @throws EncodeException if in the {@code encode-error} state
   * @throws IllegalStateException if in the {@code encode-cont} state
   * @throws NullPointerException if the encoded value is {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNull() throws EncodeException {
    final T value = this.get();
    if (value != null) {
      return value;
    } else {
      throw new NullPointerException("encoded value is null");
    }
  }

  /**
   * Returns the encoded value, if in the {@code encode-done} state;
   * otherwise throws an unchecked exception. Subclasses may optionally
   * return a value in other states. The default implementation delegates
   * to {@link #get()}, catching any {@code EncodeException} and rethrowing
   * it as the cause of a {@code NoSuchElementException}.
   *
   * @return the encoded value, if available
   * @throws NoSuchElementException if in the {@code encode-error} state
   * @throws IllegalStateException if in the {@code encode-cont} state
   */
  @CheckReturnValue
  public @Nullable T getUnchecked() {
    try {
      return this.get();
    } catch (EncodeException cause) {
      throw new NoSuchElementException("encode error", cause);
    }
  }

  /**
   * Returns the encoded value, if in the {@code encode-done} state and
   * the encoded value is not {@code null}; otherwise throws an unchecked
   * exception. Subclasses may optionally return a non-{@code null} value
   * in other states. The default implementation delegates to
   * {@link #getNonNull()}, catching any {@code EncodeException}
   * and rethrowing it as the cause of a {@code NoSuchElementException}.
   *
   * @return the encoded value, if available and not {@code null}
   * @throws NoSuchElementException if in the {@code encode-error} state
   * @throws IllegalStateException if in the {@code encode-cont} state
   * @throws NullPointerException if the encoded value is {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullUnchecked() {
    try {
      return this.getNonNull();
    } catch (EncodeException cause) {
      throw new NoSuchElementException("encode error", cause);
    }
  }

  /**
   * Returns the encoded value, if in the {@code encode-done} state;
   * otherwise returns the given {@code defaultValue}. The default
   * implementation delegates to {@link #get()}, catching any
   * {@code EncodeException} or {@code IllegalStateException}
   * to instead return {@code defaultValue}.
   *
   * @param defaultValue returned when a encoded value is not available
   * @return either the encoded value, or the {@code defaultValue}
   */
  @CheckReturnValue
  public @Nullable T getOr(@Nullable T defaultValue) {
    try {
      return this.get();
    } catch (EncodeException | IllegalStateException cause) {
      return defaultValue;
    }
  }

  /**
   * Returns the encoded value, if in the {@code encode-done} state and
   * the encoded value is not {@code null}; otherwise returns the given
   * non-{@code null} {@code defaultValue}. The default implementation
   * delegates to {@link #getNonNull()}, catching any {@code EncodeException},
   * {@code IllegalStateException}, or {@code NullPointerException}
   * to instead {@code null}-check and return the {@code defaultValue}.
   *
   * @param defaultValue non-{@code null} value returned when
   *        the encoded value is {@code null} or not available
   * @return either the non-{@code null} encoded value,
   *         or the non-{@code null} {@code defaultValue}
   * @throws NullPointerException if the encoded value and
   *         the {@code defaultValue} are both {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullOr(@NonNull T defaultValue) {
    try {
      return this.getNonNull();
    } catch (EncodeException | IllegalStateException | NullPointerException cause) {
      if (defaultValue != null) {
        return defaultValue;
      } else {
        throw new NullPointerException("default value is null");
      }
    }
  }

  /**
   * Returns the encoded value, if in the {@code encode-done} state;
   * otherwise returns the value returned by the given {@code supplier}
   * function. The default implementation delegates to {@link #get()},
   * catching any {@code ENcodeException} or {@code IllegalStateException}
   * to instead return the value returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a return value when
   *        an encoded value is not available
   * @return either the encoded value, or the value returned
   *         by the {@code supplier} function
   */
  @CheckReturnValue
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    try {
      return this.get();
    } catch (EncodeException | IllegalStateException cause) {
      return supplier.get();
    }
  }

  /**
   * Returns the encoded value, if in the {@code encode-done} state and
   * the encoded value is not {@code null}; otherwise returns the
   * non-{@code null} value returned by the given {@code supplier} function.
   * The default implementation delegates to {@link #getNonNull()},
   * catching any {@code EncodeException}, {@code IllegalStateException},
   * or {@code NullPointerException} to instead {@code null}-check and
   * return the value returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a non-{@code null} return value
   *        when the encoded value is {@code null} or not available
   * @return either the non-{@code null} encoded value, or the
   *         non-{@code null} value returned by the {@code supplier} function
   * @throws NullPointerException if the encoded value and the value returned
   *         by the {@code supplier} function are both {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullOrElse(Supplier<? extends T> supplier) {
    try {
      return this.getNonNull();
    } catch (EncodeException | IllegalStateException | NullPointerException cause) {
      final T value = supplier.get();
      if (value != null) {
        return value;
      } else {
        throw new NullPointerException("supplied value is null");
      }
    }
  }

  /**
   * Returns the encode error, if in the {@code encode-error} state;
   * otherwise throws an unchecked exception.
   *
   * @return the encode error, if present
   * @throws IllegalStateException if not in the {@code encode-error} state
   */
  @CheckReturnValue
  public Throwable getError() {
    throw new IllegalStateException("no encode error");
  }

  /**
   * Casts this {@code Encode} instance to a different encoded value type,
   * if in the {@code encode-error} state; otherwise throws an unchecked
   * exception. {@code Encode} instances in the {@code encode-error} state
   * are bi-variant with respect to their encoded value type since they
   * never actually return an encoded value.
   * <p>
   * If not already in the {@code encode-error} state, returns a new
   * {@code Encode} instance in the {@code encode-error} state that
   * wraps an {@code IllegalStateException}.
   *
   * @return {@code this}, if in the {@code encode-error} state
   */
  public <T2> Encode<T2> asError() {
    return Encode.error(new IllegalStateException("incomplete encode"));
  }

  /**
   * Throws a checked exception if in the {@code encode-error} state,
   * otherwise returns {@code this}. If in the {@code encode-error} state
   * and the encode error is an instance of {@code EncodeException},
   * the encode error is rethrown; otherwise a new {@code EncodeException}
   * is thrown with the encode error as its cause.
   *
   * @return {@code this}, if not in the {@code encode-error} state
   * @throws EncodeException if in the {@code encode-error} state
   */
  public Encode<T> checkError() throws EncodeException {
    return this;
  }

  /**
   * Throws a checked exception if not in the {@code encode-done} state,
   * otherwise returns {@code this}. If in the {@code encode-error} state
   * and the encode error is an instance of {@code EncodeException},
   * the encode error is rethrown; otherwise a new {@code EncodeException}
   * is thrown with the encode error as its cause. If in the
   * {@code encode-cont} state, a new {@code EncodeException}
   * is thrown to indicate an incomplete encode.
   *
   * @return {@code this}, if in the {@code encode-done} state
   * @throws EncodeException if not in the {@code encode-done} state
   */
  public Encode<T> checkDone() throws EncodeException {
    throw new EncodeException("incomplete encode");
  }

  /**
   * Throws an {@link AssertionError} if not in the {@code encode-done} state,
   * otherwise returns {@code this}. The {@code AssertionError} will set the
   * encode error as its cause, if in the {@code encode-error} state.
   *
   * @return {@code this}, if in the {@code encode-done} state
   * @throws AssertionError if not in the {@code encode-done} state
   */
  public Encode<T> assertDone() {
    throw new AssertionError("incomplete encode");
  }

  /**
   * Converts this {@code Encode} instance to a {@link Result}. {@code Encode}
   * states map to {@code Result} states according to the following rules:
   * <ul>
   * <li>Returns an {@link Result#ok(Object) ok result} containing
   *     the decoded value when in the {@code encode-done} state
   * <li>Returns an {@link Result#error(Throwable) error result} wrapping
   *     the encode error when in the {@code encode-error} state
   * <li>Returns an {@code error result} wrapping an
   *     {@code IllegalStateException} when in the {@code encode-cont} state
   * </ul>
   *
   * @return the result of this encode operation
   */
  @CheckReturnValue
  public Result<T> toResult() {
    try {
      return Result.ok(this.get());
    } catch (EncodeException | IllegalStateException cause) {
      return Result.error(cause);
    }
  }

  /**
   * Returns an {@code Encode} instance that continues encoding {@code that}
   * after it finishes encoding {@code this}.
   *
   * @param that the {@code Encode} instance to encode after {@code this}
   * @return an {@code Encode} instance that encodes {@code this},
   *         followed by {@code that}
   */
  public <T2> Encode<T2> andThen(Encode<T2> that) {
    Objects.requireNonNull(that);
    return new EncodeAndThen<T2>(this, that);
  }

  /**
   * Singleton {@code Encode} instance in the {@code encode-done} state
   * containing a {@code null} encoded value.
   */
  private static final Encode<Object> DONE = new EncodeDone<Object>(null);

  /**
   * Returns an {@code Encode} instance in the {@code encode-done} state
   * containing a {@code null} encoded value. Always returns the same
   * singleton {@code Encode} instance.
   *
   * @return a singleton {@code Encode} instance in the {@code encode-done}
   *         state containing a {@code null} parsed value
   */
  @CheckReturnValue
  public static <T> Encode<T> done() {
    return Assume.conforms(DONE);
  }

  /**
   * Returns an {@code Encode} instance in the {@code encode-done} state
   * containing the given encoded {@code value}. If {@code value} is
   * {@code null}, returns the singleton {@link Encode#done()} instance.
   *
   * @param value the encoded value to be contained by
   *        the returned {@code Encode} instance
   * @return an {@code Encode} instance in the {@code encode-done} state
   *         containing the encoded {@code value}
   */
  @CheckReturnValue
  public static <T> Encode<T> done(@Nullable T value) {
    if (value != null) {
      return new EncodeDone<T>(value);
    } else {
      return Assume.conforms(DONE);
    }
  }

  /**
   * Returns an {@code Encode} instance in the {@code encode-error} state
   * that wraps the given encode {@code error}.
   *
   * @param error the encode error to be wrapped by
   *        the returned {@code Encode} instance
   * @return an {@code Encode} instance in the {@code encode-error} state
   *         that wraps the encode {@code error}
   */
  @CheckReturnValue
  public static <T> Encode<T> error(Throwable error) {
    Objects.requireNonNull(error);
    return new EncodeError<T>(error);
  }

}

final class EncodeDone<T> extends Encode<T> implements ToSource {

  private final @Nullable T value;

  EncodeDone(@Nullable T value) {
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
  public Encode<T> produce(OutputBuffer<?> output) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() {
    if (this.value != null) {
      return this.value;
    } else {
      throw new NullPointerException("encoded value is null");
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    if (this.value != null) {
      return this.value;
    } else {
      throw new NullPointerException("encoded value is null");
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getOr(@Nullable T defaultValue) {
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOr(@NonNull T defaultValue) {
    if (this.value != null) {
      return this.value;
    } else if (defaultValue != null) {
      return defaultValue;
    } else {
      throw new NullPointerException("default value is null");
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOrElse(Supplier<? extends T> supplier) {
    if (this.value != null) {
      return this.value;
    } else {
      final T value = supplier.get();
      if (value != null) {
        return value;
      } else {
        throw new NullPointerException("supplied value is null");
      }
    }
  }

  @Override
  public Encode<T> checkDone() {
    return this;
  }

  @Override
  public Encode<T> assertDone() {
    return this;
  }

  @CheckReturnValue
  @Override
  public Result<T> toResult() {
    return Result.ok(this.value);
  }

  @Override
  public <T2> Encode<T2> andThen(Encode<T2> that) {
    Objects.requireNonNull(that);
    return that;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof EncodeDone<?> that) {
      return Objects.equals(this.value, that.value);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(EncodeDone.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.value)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Encode", "done");
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
  public @Nullable T get() throws EncodeException {
    if (this.error instanceof EncodeException) {
      throw (EncodeException) this.error;
    } else {
      throw new EncodeException("encode failed", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() throws EncodeException {
    if (this.error instanceof EncodeException) {
      throw (EncodeException) this.error;
    } else {
      throw new EncodeException("encode failed", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    throw new NoSuchElementException("encode failed", this.error);
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    throw new NoSuchElementException("encode failed", this.error);
  }

  @CheckReturnValue
  @Override
  public @Nullable T getOr(@Nullable T defaultValue) {
    return defaultValue;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOr(@NonNull T defaultValue) {
    if (defaultValue != null) {
      return defaultValue;
    } else {
      throw new NullPointerException("default value is null");
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    return supplier.get();
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOrElse(Supplier<? extends T> supplier) {
    final T value = supplier.get();
    if (value != null) {
      return value;
    } else {
      throw new NullPointerException("supplied value is null");
    }
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
  public Encode<T> checkError() throws EncodeException {
    if (this.error instanceof EncodeException) {
      throw (EncodeException) this.error;
    } else {
      throw new EncodeException("encode failed", this.error);
    }
  }

  @Override
  public Encode<T> checkDone() throws EncodeException {
    if (this.error instanceof EncodeException) {
      throw (EncodeException) this.error;
    } else {
      throw new EncodeException("encode failed", this.error);
    }
  }

  @Override
  public Encode<T> assertDone() {
    throw new AssertionError("encode failed", this.error);
  }

  @CheckReturnValue
  @Override
  public Result<T> toResult() {
    return Result.error(this.error);
  }

  @Override
  public <T2> Encode<T2> andThen(Encode<T2> that) {
    Objects.requireNonNull(that);
    return Assume.conforms(this);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof EncodeError<?> that) {
      return this.error.equals(that.error);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(EncodeError.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.error.hashCode()));
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
  public boolean equals(@Nullable Object other) {
    if (other instanceof EncodeAndThen<?> that) {
      return this.head.equals(that.head)
          && this.tail.equals(that.tail);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(EncodeAndThen.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.head.hashCode()), this.tail.hashCode()));
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
