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

import java.io.Flushable;
import java.util.NoSuchElementException;
import java.util.function.Supplier;
import swim.annotations.CheckReturnValue;
import swim.annotations.Covariant;
import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Result;

/**
 * A non-blocking chunked output stream. {@code Output} facilitates
 * interruptible writing of network protocols and data formats.
 *
 * <h2>Output tokens</h2>
 * <p>
 * Output tokens are modeled as primitive {@code int} values, commonly
 * representing Unicode code points, or raw octets. The semantics of
 * output tokens is specified by individual {@code Output} subclasses.
 *
 * <h2>Output states</h2>
 * <p>
 * An {@code Output} instance is always in one—and only one—of the following
 * four <em>output states</em>:
 * <ul>
 * <li>{@link #isCont() output-cont}: the output stream is ready to
 *     {@link #write(int)} an output token
 * <li>{@link #isFull() output-full}: the output stream has reached
 *     the end of the current output chunk
 * <li>{@link #isDone() output-done}: the output stream has reached
 *     the end of the last output chunk
 * <li>{@link #isError() output-error}: the output stream terminated
 *     with an {@linkplain #getError() output error}
 * </ul>
 *
 * <h2>Output chunks</h2>
 * <p>
 * {@code Output} methods never block. An output stream that would otherwise
 * need to block awaiting additional output capacity instead enters the
 * {@code output-full} state, signaling the output producer to asynchronously
 * wait for additional output capacity before continuing. If no additional
 * output capacity will ever become available, the output stream enters the
 * {@code output-done} state, signaling the output producer to terminate.
 * The {@link #isLast()} method indicates whether the output stream will
 * enter the {@code output-full} state or the {@code output-done} state
 * when it reaches the end of the current output chunk.
 *
 * <h2>Output results</h2>
 * <p>
 * An output stream wraps an <em>output value</em> of type {@code T}, which
 * can be obtained by calling a member of the {@code get} family of methods:
 * <ul>
 * <li>{@link #get()}: returns the output value, if available;
 *     otherwise throws an exception
 * <li>{@link #getNonNull()}: returns the output value, if available
 *     and not {@code null}; otherwise throws an exception
 * <li>{@link #getUnchecked()}: returns the output value, if available;
 *     otherwise throws an unchecked exception
 * <li>{@link #getNonNullUnchecked()}: returns the output value, if available
 *     and not {@code null}; otherwise throws an unchecked exception
 * <li>{@link #getOr(Object) getOr(T)}: returns the output value, if available;
 *     otherwise returns some other value
 * <li>{@link #getNonNullOr(Object) getNonNullOr(T)}: returns the output value,
 *     if available and not {@code null}; otherwise returns some other value
 * <li>{@link #getOrElse(Supplier)}: returns the output value, if available;
 *     otherwise returns a value supplied by a function
 * <li>{@link #getNonNullOrElse(Supplier)}: returns the output value,
 *     if available and not {@code null}, otherwise returns a value
 *     supplied by a function
 * </ul>
 * <p>
 * A failed output stream wraps a throwable <em>output error</em>,
 * which can be obtained by calling the {@link #getError()} method.
 *
 * <h2>Cloning</h2>
 * <p>
 * An output stream may be {@linkplain #clone() cloned} to branch the stream
 * in an implementation-defined manner. Not all {@code Output} implementations
 * support cloning.
 *
 * @param <T> the type of value to output
 *
 * @see Writer
 * @see OutputBuffer
 */
@Public
@Since("5.0")
public abstract class Output<@Covariant T> implements Flushable {

  /**
   * Constructs a new {@code Output} instance.
   */
  protected Output() {
    // nop
  }

  /**
   * Returns {@code true} when in the {@code output-cont} state,
   * ready to {@link #write(int)} an output token.
   *
   * @return whether or not this {@code Output} instance is
   *         in the {@code output-cont} state
   */
  public abstract boolean isCont();

  /**
   * Returns {@code true} when in the {@code output-full} state,
   * having reached the end of the current output chunk.
   *
   * @return whether or not this {@code Output} instance is
   *         in the {@code output-full} state
   */
  public abstract boolean isFull();

  /**
   * Returns {@code true} when in the {@code output-done} state,
   * having reached the end of the last output chunk.
   *
   * @return whether or not this {@code Output} instance is
   *         in the {@code output-done} state
   */
  public abstract boolean isDone();

  /**
   * Returns {@code true} when in the {@code output-error} state,
   * having terminated with an {@linkplain #getError() output error}.
   *
   * @return whether or not this {@code Output} instance is
   *         in the {@code output-error} state
   */
  public abstract boolean isError();

  /**
   * Returns {@code true} when in either the {@code output-cont} state
   * or the {@code output-done} state, indicating that writing can
   * potentially make further progress.
   *
   * @return whether or not this {@code Output} instance is in either the
   *         {@code output-cont} state or the {@code output-done} state
   */
  public boolean isReady() {
    return this.isCont() || this.isDone();
  }

  /**
   * Returns {@code true} when in either the {@code output-full} state
   * or the {@code output-error} state, indicating that writing can't
   * make further progress at this time.
   *
   * @return whether or not this {@code Output} instance is in either the
   *         {@code output-full} state or the {@code output-error} state
   */
  public boolean isBreak() {
    return this.isFull() || this.isError();
  }

  /**
   * Returns {@code true} if this output stream will enter the
   * {@code output-done} state when it reaches the end of the current
   * output chunk; otherwise returns {@code false} if the output stream
   * will enter the {@code output-full} state when it reaches the end
   * of the current output chunk.
   *
   * @return whether this output stream will enter the {@code output-done}
   *         state or the {@code output-full} state when it reaches the end
   *         of the current output chunk
   */
  public abstract boolean isLast();

  /**
   * Sets the {@link #isLast()} flag to {@code last} and returns {@code this}.
   * If {@code last} is {@code true}, the output stream will enter the
   * {@code output-done} state when it reaches the end of the current
   * output chunk; if {@code last} is {@code false}, the output stream
   * will enter the {@code output-full} state when it reaches the end
   * of the current output chunk.
   *
   * @param last whether the output stream should enter the {@code output-done}
   *        state or the {@code output-full} state when it reaches the end
   *        of the current output chunk
   * @return {@code this}
   */
  public abstract Output<T> asLast(boolean last);

  /**
   * Writes a single {@code token} to the output stream, if in the
   * {@code output-cont} state, and returns {@code this}.
   *
   * @param token the output token to write to the output stream
   * @return {@code this}
   * @throws IllegalStateException if not in the {@code output-cont} state
   */
  public abstract Output<T> write(int token);

  /**
   * Writes any internally buffered tokens to the underlying output stream.
   */
  @Override
  public void flush() {
    // nop
  }

  /**
   * Returns the output value, if not in the {@code output-error} state;
   * otherwise throws an exception. Subclasses may optionally return a value
   * in other states.
   *
   * @return the current output value, if available
   * @throws OutputException if in the {@code output-error} state
   */
  @CheckReturnValue
  public abstract @Nullable T get() throws OutputException;

  /**
   * Returns the output value, if not in the {@code output-done} state,
   * and the output value is not {@code null}; otherwise throws an exception.
   * Subclasses may optionally return a non-{@code null} value in other states.
   * The default implementation delegates to {@link #get()},
   * {@code null}-checking its return value.
   *
   * @return the current output value, if available and not {@code null}
   * @throws OutputException if in the {@code output-error} state
   * @throws NullPointerException if the output value is {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNull() throws OutputException {
    final T value = this.get();
    if (value == null) {
      throw new NullPointerException("output value is null");
    }
    return value;
  }

  /**
   * Returns the output value, if not in the {@code output-error} state;
   * otherwise throws an unchecked exception. Subclasses may optionally
   * return a value in other states. The default implementation delegates
   * to {@link #get()}, catching any {@code OutputException} and rethrowing
   * it as the cause of a {@code NoSuchElementException}.
   *
   * @return the current output value, if available
   * @throws NoSuchElementException if in the {@code output-error} state
   */
  @CheckReturnValue
  public @Nullable T getUnchecked() {
    try {
      return this.get();
    } catch (OutputException cause) {
      throw new NoSuchElementException("output error", cause);
    }
  }

  /**
   * Returns the output value, if in not the {@code output-error} state,
   * and the output value is not {@code null}; otherwise throws an unchecked
   * exception. Subclasses may optionally return a non-{@code null} value
   * in other states. The default implementation delegates to
   * {@link #getNonNull()}, catching any {@code OutputException}
   * and rethrowing it as the cause of a {@code NoSuchElementException}.
   *
   * @return the current output value, if available and not {@code null}
   * @throws NoSuchElementException if in the {@code output-error} state
   * @throws NullPointerException if the output value is {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullUnchecked() {
    try {
      return this.getNonNull();
    } catch (OutputException cause) {
      throw new NoSuchElementException("output error", cause);
    }
  }

  /**
   * Returns the output value, if not in the {@code output-error} state;
   * otherwise returns some {@code other}. The default implementation
   * delegates to {@link #get()}, catching any {@code OutputException}
   * to instead return {@code other}.
   *
   * @param other returned when a current output value is not available
   * @return either the current output value, or the {@code other} value
   */
  @CheckReturnValue
  public @Nullable T getOr(@Nullable T other) {
    try {
      return this.get();
    } catch (OutputException cause) {
      return other;
    }
  }

  /**
   * Returns the output value, if not in the {@code output-error} state,
   * and the output value is not {@code null}; otherwise returns some
   * non-{@code null} {@code other}. The default implementation delegates
   * to {@link #getNonNull()}, catching any {@code OutputException},
   * or {@code NullPointerException} to instead {@code null}-check
   * and return the {@code other} value.
   *
   * @param other non-{@code null} value returned when
   *        the output value is {@code null} or not available
   * @return either the current non-{@code null} output value,
   *         or the non-{@code null} {@code other}
   * @throws NullPointerException if the current output value
   *         and the {@code other} are both {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullOr(@NonNull T other) {
    try {
      return this.getNonNull();
    } catch (OutputException | NullPointerException cause) {
      if (other == null) {
        throw new NullPointerException("other value is null");
      }
      return other;
    }
  }

  /**
   * Returns the output value, if not in the {@code output-error} state;
   * otherwise returns the value returned by the given {@code supplier}
   * function. The default implementation delegates to {@link #get()},
   * catching any {@code OutputException} to instead return the value
   * returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a return value when
   *        a current output value is not available
   * @return either the current output value, or the value
   *         returned by the {@code supplier} function
   */
  @CheckReturnValue
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    try {
      return this.get();
    } catch (OutputException cause) {
      return supplier.get();
    }
  }

  /**
   * Returns the output value, if not in the {@code output-error} state,
   * and the output value is not {@code null}; otherwise returns the
   * non-{@code null} value returned by the given {@code supplier} function.
   * The default implementation delegates to {@link #getNonNull()},
   * catching any {@code OutputException}or {@code NullPointerException}
   * to instead {@code null}-check and return the value returned by the
   * {@code supplier} function.
   *
   * @param supplier invoked to obtain a non-{@code null} return value
   *        when the current output value is {@code null} or not available
   * @return either the non-{@code null} current output value, or the
   *         non-{@code null} value returned by the {@code supplier} function
   * @throws NullPointerException if the current output value and the value
   *         returned by the {@code supplier} function are both {@code null}
   */
  @CheckReturnValue
  public @NonNull T getNonNullOrElse(Supplier<? extends T> supplier) {
    try {
      return this.getNonNull();
    } catch (OutputException | NullPointerException cause) {
      final T value = supplier.get();
      if (value == null) {
        throw new NullPointerException("supplied value is null");
      }
      return value;
    }
  }

  /**
   * Returns the output error, if in the {@code output-error} state;
   * otherwise throws an unchecked exception.
   *
   * @return the output error, if present
   * @throws IllegalStateException if not in the {@code output-error} state
   */
  @CheckReturnValue
  public Throwable getError() {
    throw new IllegalStateException("no output error");
  }

  /**
   * Converts this {@code Output} instance to a {@link Result}. {@code Output}
   * states map to {@code Result} states according to the following rules:
   * <ul>
   * <li>Returns an {@link Result#ok(Object) ok result} containing
   *     the current output value when not in the {@code output-error} state
   * <li>Returns an {@link Result#error(Throwable) error result} wrapping
   *     the output error when in the {@code output-error} state
   * </ul>
   *
   * @return the result of this output operation
   */
  @CheckReturnValue
  public Result<T> toResult() {
    try {
      return Result.ok(this.get());
    } catch (OutputException cause) {
      return Result.error(cause);
    }
  }

  /**
   * Returns an implementation-defined branch of this output stream.
   * Tokens written to this output stream do not affect the cloned
   * output stream, and vice versa.
   *
   * @return a new {@code Output} instance that is independent
   *         of this output stream
   * @throws UnsupportedOperationException if this output stream
   *         can't be cloned
   */
  @Override
  public Output<T> clone() {
    throw new UnsupportedOperationException();
  }

}
