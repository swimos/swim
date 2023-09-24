// Copyright 2015-2023 Nstream, inc.
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
import java.util.function.Function;
import java.util.function.Supplier;
import swim.annotations.CheckReturnValue;
import swim.annotations.Covariant;
import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteSource;

/**
 * The state of an interruptible decode operation. A {@code Decode} instance
 * {@linkplain #consume(InputBuffer) consumes} an {@linkplain InputBuffer
 * input buffer} chunk, returning a new {@code Decode} instance representing
 * the continuation of the decode operation. Decoding continues chunk by chunk
 * until a {@code Decode} instance in a terminal state is reached. This
 * approach enables efficient, interruptible decoding of composite network
 * protocols and data formats without blocking or intermediate buffering.
 *
 * <h2>Decode states</h2>
 * <p>
 * A {@code Decode} instance is always in one—and only one—of the following
 * three <em>decode states</em>:
 * <ul>
 * <li>{@link #isCont() decode-cont}: the decode operation is ready
 *     to {@linkplain #consume(InputBuffer) consume} more input
 * <li>{@link #isDone() decode-done}: the decode operation terminated
 *     with a {@linkplain #get() decoded value}
 * <li>{@link #isError() decode-error}: the decode operation terminated
 *     with a {@linkplain #getError() decode error}
 * </ul>
 * <p>
 * {@code Decode} subclasses default to the {@code decode-cont} state.
 * {@link Decode#done(Object) Decode.done(T)} returns an instance in the
 * {@code decode-done} state. {@link Decode#error(Throwable)} returns an
 * instance in the {@code decode-error} state.
 *
 * <h2>Consuming input</h2>
 * <p>
 * The {@link #consume(InputBuffer)} method decodes a single input chunk
 * and returns a new {@code Decode} instance representing the updated state
 * of the decode operation. Any returned {@code Decode} instance in the
 * {@code decode-cont} state should eventually be called to {@code consume}
 * an additional input chunk. If the end of input is reached, {@code consume}
 * should be called with input in the {@link InputBuffer#isDone() input-done}
 * state. The decode operation terminates when {@code consume} returns a
 * {@code Decode} instance in either the {@code decode-done} state or the
 * {@code decode-error} state.
 *
 * <h2>Decode results</h2>
 * <p>
 * A successful decode operation wraps a <em>decoded value</em> of type
 * {@code T}, which can be obtained by calling a member of the {@code get}
 * family of methods:
 * <ul>
 * <li>{@link #get()}: returns the decoded value, if available;
 *     otherwise throws an exception
 * <li>{@link #getNonNull()}: returns the decoded value, if available
 *     and not {@code null}; otherwise throws an exception
 * <li>{@link #getUnchecked()}: returns the decoded value, if available;
 *     otherwise throws an unchecked exception
 * <li>{@link #getNonNullUnchecked()}: returns the decoded value, if available
 *     and not {@code null}; otherwise throws an unchecked exception
 * <li>{@link #getOr(Object) getOr(T)}: returns the decoded value, if available;
 *     otherwise returns some other value
 * <li>{@link #getNonNullOr(Object) getNonNullOr(T)}: returns the decoded value,
 *     if available and not {@code null}; otherwise returns some other value
 * <li>{@link #getOrElse(Supplier)}: returns the decoded value, if available;
 *     otherwise returns a value supplied by a function
 * <li>{@link #getNonNullOrElse(Supplier)}: returns the decoded value,
 *     if available and not {@code null}, otherwise returns a value
 *     supplied by a function
 * </ul>
 * <p>
 * A failed decode operation wraps a throwable <em>decode error</em>,
 * which can be obtained by calling the {@link #getError()} method.
 *
 * <h2>Decode continuations</h2>
 * <p>
 * Think of a {@code Decode} instance in the {@code decode-cont} state as
 * capturing the call stack of a decode operation at the point where it ran
 * out of available input. When {@code consume} is subsequently called with
 * new input, the call stack is reconstructed, and decoding continues where
 * it left off. The stack is captured by returning a {@code Decode} instance
 * containing the state of each decode frame as the stack unwinds. The stack is
 * restored by invoking {@code consume} on any nested {@code Decode} instances
 * that were captured when the decode operation was previously interrupted.
 *
 * <h2>Backpressure propagation</h2>
 * <p>
 * {@code Decode} subclasses can optionally propagate backpressure by
 * overriding the {@link #backoff(InputFuture)} method. Backpressure-aware
 * decoders invoke {@code backoff} with an {@code InputFuture} after every
 * call to {@code consume}. If {@code backoff} returns {@code true}, the
 * decoder will not invoke {@code consume} again until the {@code Decode}
 * instance calls {@link InputFuture#requestInput()}. Returning {@code false}
 * from {@code backoff} indicates that the {@code Decode} instance is currently
 * ready to consume more input.
 *
 * <h2>Immutability</h2>
 * <p>
 * {@code Decode} instances should be immutable whenever possible.
 * Specifically, an invocation of {@code consume} should not alter the behavior
 * of subsequent calls to {@code consume} on the same {@code Decode} instance.
 * A {@code Decode} instance should only mutate its internal state when it's
 * essential to do so, such as for critical performance optimizations.
 *
 * @param <T> the type of decoded value
 *
 * @see InputBuffer
 * @see Decoder
 */
@Public
@Since("5.0")
public abstract class Decode<@Covariant T> {

  /**
   * Constructs a {@code Decode} instance in the {@code decode-cont} state.
   */
  protected Decode() {
    // nop
  }

  /**
   * Returns {@code true} when in the {@code decode-cont} state,
   * ready to {@linkplain #consume(InputBuffer) consume} more input.
   *
   * @return whether or not this {@code Decode} instance is
   *         in the {@code decode-cont} state
   */
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when in the {@code decode-done} state,
   * having terminated with a {@linkplain #get() decoded value}.
   *
   * @return whether or not this {@code Decode} instance is
   *         in the {@code decode-done} state
   */
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when in the {@code decode-error} state,
   * having terminated with a {@linkplain #getError() decode error}.
   *
   * @return whether or not this {@code Decode} instance is
   *         in the {@code decode-error} state
   */
  public boolean isError() {
    return false;
  }

  /**
   * Decodes an {@code input} chunk and returns a new {@code Decode} instance
   * representing the updated state of the decode operation. If the input
   * enters the {@link InputBuffer#isDone() input-done} state, then
   * {@code consume} <em>must</em> return a terminated {@code Decode} instance
   * in either the {@code decode-done} state or the {@code decode-error} state.
   * The given {@code input} is only guaranteed to be valid for the duration
   * of the method call; references to {@code input} should not be retained.
   *
   * @param input the input buffer to consume
   * @return the continuation of the decode operation
   */
  public abstract Decode<T> consume(InputBuffer input);

  /**
   * Ensures that a value has been successfully decoded,
   * and the end of {@code input} has been reached.
   * The following conditions are sequentially evaluated:
   * <ul>
   * <li>When in the {@code decode-error} state, returns {@code this}
   *     so as to not clobber prior decode errors.
   * <li>If the {@code input} is in the {@link InputBuffer#isError()
   *     input-error} state, returns the input exception wrapped
   *     in a new {@code Decode} error.
   * <li>If the {@code input} is in the {@link InputBuffer#isCont()
   *     input-cont} state, returns a new {@code Decode} error
   *     indicating that the input was not fully consumed.
   * <li>When in the {@code decode-cont} state, returns a new
   *     {@code Decode} error indicating an unexpected end of input.
   * <li>Otherwise returns {@code this}, having reached the end of input
   *     in the {@code decode-done} state.
   * </ul>
   *
   * @param input the input buffer whose end should have been reached
   * @return {@code this} if in the {@code decode-done} state, having
   *         reached the end of {@code input}; otherwise returns a
   *         {@code Decode} instance in the {@code decode-error} state
   */
  public Decode<T> complete(InputBuffer input) {
    if (input.isError()) {
      return Decode.error(input.getError());
    } else if (input.isCont()) {
      return Decode.error(new DecodeException("unconsumed input"));
    } else {
      return Decode.error(new DecodeException("unexpected end of input"));
    }
  }

  /**
   * Provides an opportunity for the {@code Decode} instance to propagate
   * backpressure to the caller. Returns {@code true} if the {@code Decode}
   * instance will invoke {@link InputFuture#requestInput() future.requestInput()}
   * when it's ready to consume more input; otherwise returns {@code false}
   * if the {@code Decode} instance is currently ready to consume more input.
   * The default implementation returns {@code false}.
   * <p>
   * After {@code backoff} returns {@code true}, but before {@code
   * future.requestInput()} is called, the {@code Decode} instance enters the
   * implicit {@code decode-backoff} state. Once in the {@code decode-backoff}
   * state, it is responsibility of the {@code Decode} instance to ensure that
   * {@code future.requestInput()} eventually gets called.
   * <p>
   * Decode backoff is advisory. A decoder may invoke {@code consume}
   * at any time. Even backpressure-aware decoders may disregard the
   * {@code decode-backoff} state and invoke {@code consume} with a
   * terminated input in order to terminate a decode operation.
   * <p>
   * Consider the example of a proxy stream that decodes one input,
   * and encodes another output. There's no point invoking {@code consume}
   * on the decode end of the stream if the encode end's output is full.
   * Such a stream can wait for output capacity to become available
   * before calling {@code future.requestInput()}.
   *
   * @param future an input future that will trigger an invocation of
   *        {@code consume} after its {@code requestInput} method is called
   * @return whether or not the decoder should wait to invoke {@code consume}
   *         until after {@code future.requestInput()} is called
   */
  public boolean backoff(InputFuture future) {
    return false;
  }

  /**
   * Returns the decoded value, if in the {@code decode-done} state;
   * otherwise throws an exception. Subclasses may optionally return
   * a value in other states.
   *
   * @return the decoded value, if available
   * @throws DecodeException if in the {@code decode-error} state
   * @throws IllegalStateException if in the {@code decode-cont} state
   */
  @CheckReturnValue
  public @Nullable T get() throws DecodeException {
    throw new IllegalStateException("incomplete decode");
  }

  /**
   * Returns the decoded value, if in the {@code decode-done} state and
   * the decoded value is not {@code null}; otherwise throws an exception.
   * Subclasses may optionally return a non-{@code null} value in other states.
   * The default implementation delegates to {@link #get()},
   * {@code null}-checking its return value.
   *
   * @return the decoded value, if available and not {@code null}
   * @throws DecodeException if in the {@code decode-error} state
   * @throws IllegalStateException if in the {@code decode-cont} state
   * @throws NullPointerException if the decoded value is {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNull() throws DecodeException {
    final T value = this.get();
    if (value == null) {
      throw new NullPointerException("decoded value is null");
    }
    return value;
  }

  /**
   * Returns the decoded value, if in the {@code decode-done} state;
   * otherwise throws an unchecked exception. Subclasses may optionally
   * return a value in other states. The default implementation delegates
   * to {@link #get()}, catching any {@code DecodeException} and rethrowing
   * it as the cause of a {@code NoSuchElementException}.
   *
   * @return the decoded value, if available
   * @throws NoSuchElementException if in the {@code decode-error} state
   * @throws IllegalStateException if in the {@code decode-cont} state
   */
  @CheckReturnValue
  public @Nullable T getUnchecked() {
    try {
      return this.get();
    } catch (DecodeException cause) {
      throw new NoSuchElementException("decode error", cause);
    }
  }

  /**
   * Returns the decoded value, if in the {@code decode-done} state and
   * the decoded value is not {@code null}; otherwise throws an unchecked
   * exception. Subclasses may optionally return a non-{@code null} value
   * in other states. The default implementation delegates to
   * {@link #getNonNull()}, catching any {@code DecodeException}
   * and rethrowing it as the cause of a {@code NoSuchElementException}.
   *
   * @return the decoded value, if available and not {@code null}
   * @throws NoSuchElementException if in the {@code decode-error} state
   * @throws IllegalStateException if in the {@code decode-cont} state
   * @throws NullPointerException if the decoded value is {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullUnchecked() {
    try {
      return this.getNonNull();
    } catch (DecodeException cause) {
      throw new NoSuchElementException("decode error", cause);
    }
  }

  /**
   * Returns the decoded value, if in the {@code decode-done} state;
   * otherwise returns some {@code other} value. The default implementation
   * delegates to {@link #get()}, catching any {@code DecodeException}
   * or {@code IllegalStateException} to instead return {@code other}.
   *
   * @param other returned when a decoded value is not available
   * @return either the decoded value, or the {@code other} value
   */
  @CheckReturnValue
  public @Nullable T getOr(@Nullable T other) {
    try {
      return this.get();
    } catch (DecodeException | IllegalStateException cause) {
      return other;
    }
  }

  /**
   * Returns the decoded value, if in the {@code decode-done} state
   * and the decoded value is not {@code null}; otherwise returns some
   * non-{@code null} {@code other}. The default implementation delegates
   * to {@link #getNonNull()}, catching any {@code DecodeException},
   * {@code IllegalStateException}, or {@code NullPointerException}
   * to instead {@code null}-check and return the {@code other} value.
   *
   * @param other non-{@code null} value returned when
   *        the decoded value is {@code null} or not available
   * @return either the non-{@code null} decoded value,
   *         or the non-{@code null} {@code other} value
   * @throws NullPointerException if the decoded value and
   *         the {@code other} value are both {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullOr(@NonNull T other) {
    try {
      return this.getNonNull();
    } catch (DecodeException | IllegalStateException | NullPointerException cause) {
      if (other == null) {
        throw new NullPointerException("other value is null");
      }
      return other;
    }
  }

  /**
   * Returns the decoded value, if in the {@code decode-done} state;
   * otherwise returns the value returned by the given {@code supplier}
   * function. The default implementation delegates to {@link #get()},
   * catching any {@code DecodeException} or {@code IllegalStateException}
   * to instead return the value returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a return value when
   *        a decoded value is not available
   * @return either the decoded value, or the value returned
   *         by the {@code supplier} function
   */
  @CheckReturnValue
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    try {
      return this.get();
    } catch (DecodeException | IllegalStateException cause) {
      return supplier.get();
    }
  }

  /**
   * Returns the decoded value, if in the {@code decode-done} state and
   * the decoded value is not {@code null}; otherwise returns the
   * non-{@code null} value returned by the given {@code supplier} function.
   * The default implementation delegates to {@link #getNonNull()},
   * catching any {@code DecodeException}, {@code IllegalStateException},
   * or {@code NullPointerException} to instead {@code null}-check and
   * return the value returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a non-{@code null} return value
   *        when the decoded value is {@code null} or not available
   * @return either the non-{@code null} decoded value, or the
   *         non-{@code null} value returned by the {@code supplier} function
   * @throws NullPointerException if the decoded value and the value returned
   *         by the {@code supplier} function are both {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullOrElse(Supplier<? extends T> supplier) {
    try {
      return this.getNonNull();
    } catch (DecodeException | IllegalStateException | NullPointerException cause) {
      final T value = supplier.get();
      if (value == null) {
        throw new NullPointerException("supplied value is null");
      }
      return value;
    }
  }

  /**
   * Returns the decode error, if in the {@code decode-error} state;
   * otherwise throws an unchecked exception.
   *
   * @return the decode error, if present
   * @throws IllegalStateException if not in the {@code decode-error} state
   */
  @CheckReturnValue
  public Throwable getError() {
    throw new IllegalStateException("no decode error");
  }

  /**
   * Casts this {@code Decode} instance to a different decoded value type,
   * if in the {@code decode-error} state; otherwise throws an unchecked
   * exception. {@code Decode} instances in the {@code decode-error} state
   * are bi-variant with respect to their decoded value type since they
   * never actually return a decoded value.
   * <p>
   * If not already in the {@code decode-error} state, returns a new
   * {@code Decode} instance in the {@code decode-error} state that
   * wraps an {@code IllegalStateException}.
   *
   * @return {@code this}, if in the {@code decode-error} state
   */
  public <T2> Decode<T2> asError() {
    return Decode.error(new IllegalStateException("incomplete decode"));
  }

  /**
   * Throws a checked exception if in the {@code decode-error} state,
   * otherwise returns {@code this}. If in the {@code decode-error} state
   * and the decode error is an instance of {@code DecodeException},
   * the decode error is rethrown; otherwise a new {@code DecodeException}
   * is thrown with the decode error as its cause.
   *
   * @return {@code this}, if not in the {@code decode-error} state
   * @throws DecodeException if in the {@code decode-error} state
   */
  public Decode<T> checkError() throws DecodeException {
    return this;
  }

  /**
   * Throws a checked exception if not in the {@code decode-done} state,
   * otherwise returns {@code this}. If in the {@code decode-error} state
   * and the decode error is an instance of {@code DecodeException},
   * the decode error is rethrown; otherwise a new {@code DecodeException}
   * is thrown with the decode error as its cause. If in the
   * {@code decode-cont} state, a new {@code DecodeException}
   * is thrown to indicate an incomplete decode.
   *
   * @return {@code this}, if in the {@code decode-done} state
   * @throws DecodeException if not in the {@code decode-done} state
   */
  public Decode<T> checkDone() throws DecodeException {
    throw new DecodeException("incomplete decode");
  }

  /**
   * Throws an {@link AssertionError} if not in the {@code decode-done} state,
   * otherwise returns {@code this}. The {@code AssertionError} will set the
   * decode error as its cause, if in the {@code decode-error} state.
   *
   * @return {@code this}, if in the {@code decode-done} state
   * @throws AssertionError if not in the {@code decode-done} state
   */
  public Decode<T> assertDone() {
    throw new AssertionError("incomplete decode");
  }

  @CheckReturnValue
  public <U> Decode<U> map(Function<? super T, ? extends U> mapper) {
    return new DecodeMapper<T, U>(this, mapper);
  }

  /**
   * Converts this {@code Decode} instance to a {@link Result}. {@code Decode}
   * states map to {@code Result} states according to the following rules:
   * <ul>
   * <li>Returns an {@link Result#ok(Object) ok result} containing
   *     the decoded value when in the {@code decode-done} state
   * <li>Returns an {@link Result#error(Throwable) error result} wrapping
   *     the decode error when in the {@code decode-error} state
   * <li>Returns an {@code error result} wrapping an
   *     {@code IllegalStateException} when in the {@code decode-cont} state
   * </ul>
   *
   * @return the result of this decode operation
   */
  @CheckReturnValue
  public Result<T> toResult() {
    try {
      return Result.ok(this.get());
    } catch (DecodeException | IllegalStateException cause) {
      return Result.error(cause);
    }
  }

  /**
   * Singleton {@code Decode} instance in the {@code decode-done} state
   * containing a {@code null} decoded value.
   */
  private static final Decode<Object> DONE = new DecodeDone<Object>(null);

  /**
   * Returns a {@code Decode} instance in the {@code decode-done} state
   * containing a {@code null} decoded value. Always returns the same
   * singleton {@code Decode} instance.
   *
   * @return a singleton {@code Decode} instance in the {@code decode-done}
   *         state containing a {@code null} decoded value
   */
  @CheckReturnValue
  public static <T> Decode<T> done() {
    return Assume.conforms(DONE);
  }

  /**
   * Returns a {@code Decode} instance in the {@code decode-done} state
   * containing the given decoded {@code value}. If {@code value} is
   * {@code null}, returns the singleton {@link Decode#done()} instance.
   *
   * @param value the decoded value to be contained by
   *        the returned {@code Decode} instance
   * @return a {@code Decode} instance in the {@code decode-done} state
   *         containing the decoded {@code value}
   */
  @CheckReturnValue
  public static <T> Decode<T> done(@Nullable T value) {
    if (value != null) {
      return new DecodeDone<T>(value);
    } else {
      return Assume.conforms(DONE);
    }
  }

  /**
   * Returns a {@code Decode} instance in the {@code decode-error} state
   * that wraps the given decode {@code error}.
   *
   * @param error the decode error to be wrapped by
   *        the returned {@code Decode} instance
   * @return a {@code Decode} instance in the {@code decode-error} state
   *         that wraps the decode {@code error}
   */
  @CheckReturnValue
  public static <T> Decode<T> error(Throwable error) {
    Objects.requireNonNull(error);
    return new DecodeError<T>(error);
  }

}

final class DecodeDone<@Covariant T> extends Decode<T> implements WriteSource {

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

  @Override
  public Decode<T> complete(InputBuffer input) {
    if (input.isError()) {
      return Decode.error(input.getError());
    } else if (input.isCont()) {
      return Decode.error(new DecodeException("unconsumed input"));
    } else {
      return this;
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() {
    if (this.value == null) {
      throw new NullPointerException("decoded value is null");
    }
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    if (this.value == null) {
      throw new NullPointerException("decoded value is null");
    }
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @Nullable T getOr(@Nullable T other) {
    return this.value;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOr(@NonNull T other) {
    if (this.value != null) {
      return this.value;
    } else if (other != null) {
      return other;
    } else {
      throw new NullPointerException("other value is null");
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
      if (value == null) {
        throw new NullPointerException("supplied value is null");
      }
      return value;
    }
  }

  @Override
  public Decode<T> checkDone() {
    return this;
  }

  @Override
  public Decode<T> assertDone() {
    return this;
  }

  @CheckReturnValue
  @Override
  public <U> Decode<U> map(Function<? super T, ? extends U> mapper) {
    try {
      return Decode.done(mapper.apply(this.value));
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Decode.error(cause);
    }
  }

  @CheckReturnValue
  @Override
  public Result<T> toResult() {
    return Result.ok(this.value);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof DecodeDone<?> that) {
      return Objects.equals(this.value, that.value);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(DecodeDone.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.value)));
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
    return WriteSource.toString(this);
  }

}

final class DecodeError<@Covariant T> extends Decode<T> implements WriteSource {

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

  @Override
  public Decode<T> complete(InputBuffer input) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() throws DecodeException {
    if (this.error instanceof DecodeException) {
      throw (DecodeException) this.error;
    } else {
      throw new DecodeException("decode failed", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() throws DecodeException {
    if (this.error instanceof DecodeException) {
      throw (DecodeException) this.error;
    } else {
      throw new DecodeException("decode failed", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    throw new NoSuchElementException("decode failed", this.error);
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    throw new NoSuchElementException("decode failed", this.error);
  }

  @CheckReturnValue
  @Override
  public @Nullable T getOr(@Nullable T other) {
    return other;
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOr(@NonNull T other) {
    if (other == null) {
      throw new NullPointerException("other value is null");
    }
    return other;
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
    if (value == null) {
      throw new NullPointerException("supplied value is null");
    }
    return value;
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
  public Decode<T> checkError() throws DecodeException {
    if (this.error instanceof DecodeException) {
      throw (DecodeException) this.error;
    } else {
      throw new DecodeException("decode failed", this.error);
    }
  }

  @Override
  public Decode<T> checkDone() throws DecodeException {
    if (this.error instanceof DecodeException) {
      throw (DecodeException) this.error;
    } else {
      throw new DecodeException("decode failed", this.error);
    }
  }

  @Override
  public Decode<T> assertDone() {
    throw new AssertionError("decode failed", this.error);
  }

  @CheckReturnValue
  @Override
  public <U> Decode<U> map(Function<? super T, ? extends U> mapper) {
    return Assume.conforms(this);
  }

  @CheckReturnValue
  @Override
  public Result<T> toResult() {
    return Result.error(this.error);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof DecodeError<?> that) {
      return this.error.equals(that.error);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(DecodeError.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.error.hashCode()));
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
    return WriteSource.toString(this);
  }

}

final class DecodeMapper<S, T> extends Decode<T> implements WriteSource {

  final Decode<S> decode;
  final Function<? super S, ? extends T> mapper;

  DecodeMapper(Decode<S> decode, Function<? super S, ? extends T> mapper) {
    this.decode = decode;
    this.mapper = mapper;
  }

  @Override
  public Decode<T> consume(InputBuffer input) {
    return this.decode.consume(input).map(this.mapper);
  }

  @Override
  public <U> Decode<U> map(Function<? super T, ? extends U> mapper) {
    return new DecodeMapper<S, U>(this.decode, this.mapper.andThen(mapper));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.decode)
            .beginInvoke("map")
            .appendArgument(this.mapper)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
