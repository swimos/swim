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
 * The state of an interruptible write operation. A {@code Write} instance
 * {@linkplain #produce(Output) produces} an {@linkplain Output output} chunk,
 * returning a new {@code Write} instance representing the continuation of the
 * write operation. Writing continues chunk by chunk until a {@code Write}
 * instance in a terminal state is reached. This approach enables efficient,
 * interruptible writing of composite network protocols and data formats
 * without blocking or intermediate buffering.
 *
 * {@code Write} instances sequentially produce output chunks token by token.
 * This enables {@code Write} instances to produce incrementally encoded output,
 * such as {@linkplain Utf8EncodedOutput UTF-8 encoded output}, without having
 * to first write unencoded output to a separate buffer. For this reason, the
 * {@code Write} interface is commonly used to implement text format writers,
 * whereas the parent {@link Encode} interface is often used to implement
 * binary format encoders.
 *
 * <h2>Output tokens</h2>
 * <p>
 * {@code Write} instances sequentially produce tokens to an {@link Output}
 * chunk. Output tokens are modeled as primitive {@code int} values, commonly
 * representing Unicode code points, or raw octets. The semantics of produced
 * output tokens is specified by individual {@code Write} subclasses.
 *
 * <h2>Write states</h2>
 * <p>
 * A {@code Write} instance is always in one—and only one—of the following
 * three <em>write states</em>:
 * <ul>
 * <li>{@link #isCont() write-cont}: the write operation is ready
 *     to {@linkplain #produce(Output) produce} more output
 * <li>{@link #isDone() write-done}: the write operation terminated
 *     with a {@linkplain #get() written value}
 * <li>{@link #isError() write-error}: the write operation terminated
 *     with a {@linkplain #getError() write error}
 * </ul>
 * <p>
 * {@code Write} subclasses default to the {@code write-cont} state.
 * {@link Write#done(Object) Write.done(T)} returns an instance in the
 * {@code write-done} state. {@link Write#error(Throwable)} returns an
 * instance in the {@code write-error} state.
 *
 * <h2>Producing output</h2>
 * <p>
 * The {@link #produce(Output)} method writes a single output chunk and returns
 * a new {@code Write} instance representing the updated state of the write
 * operation. Any returned {@code Write} instance in the {@code write-cont}
 * state should eventually be called to {@code produce} an additional output
 * chunk. If the end of output is reached, {@code produce} should be called
 * with output in the {@link Output#isDone() output-done} state. The write
 * operation terminates when {@code produce} returns a {@code Write} instance
 * in either the {@code write-done} state or the {@code write-error} state.
 *
 * <h2>Write results</h2>
 * <p>
 * A successful write operation wraps a <em>written value</em> of type
 * {@code T}, which can be obtained by calling a member of the {@code get}
 * family of methods:
 * <ul>
 * <li>{@link #get()}: returns the written value, if available;
 *     otherwise throws an exception
 * <li>{@link #getNonNull()}: returns the written value, if available
 *     and not {@code null}; otherwise throws an exception
 * <li>{@link #getUnchecked()}: returns the written value, if available;
 *     otherwise throws an unchecked exception
 * <li>{@link #getNonNullUnchecked()}: returns the written value, if available
 *     and not {@code null}; otherwise throws an unchecked exception
 * <li>{@link #getOr(Object) getOr(T)}: returns the written value, if available;
 *     otherwise returns some other value
 * <li>{@link #getNonNullOr(Object) getNonNullOr(T)}: returns the written value,
 *     if available and not {@code null}; otherwise returns some other value
 * <li>{@link #getOrElse(Supplier)}: returns the written value, if available;
 *     otherwise returns a value supplied by a function
 * <li>{@link #getNonNullOrElse(Supplier)}: returns the written value,
 *     if available and not {@code null}, otherwise returns a value
 *     supplied by a function
 * </ul>
 * <p>
 * A failed write operation wraps a throwable <em>write error</em>,
 * which can be obtained by calling the {@link #getError()} method.
 *
 * <h2>Write continuations</h2>
 * <p>
 * Think of a {@code Write} instance in the {@code write-cont} state as
 * capturing the call stack of a write operation at the point where it ran
 * out of available output capacity. When {@code produce} is subsequently
 * called with new output capacity, the call stack is reconstructed, and
 * writing continues where it left off. The stack is captured by returning
 * a {@code Write} instance containing the state of each write frame as the
 * stack unwinds. The stack is restored by invoking {@code produce} on any
 * nested {@code Write} instances that were captured when the write operation
 * was previously interrupted.
 *
 * <h2>Backpressure propagation</h2>
 * <p>
 * {@code Write} subclasses can optionally propagate backpressure by
 * overriding the {@link #backoff(OutputFuture)} method. Backpressure-aware
 * writers invoke {@code backoff} with an {@code OutputFuture} after every
 * call to {@code produce}. If {@code backoff} returns {@code true}, the
 * writer will not invoke {@code produce} again until the {@code Write}
 * instance calls {@link OutputFuture#requestOutput()}. Returning {@code false}
 * from {@code backoff} indicates that the {@code Write} instance is currently
 * ready to produce more output.
 *
 * @param <T> the type of written value
 *
 * @see Output
 * @see Writer
 */
@Public
@Since("5.0")
public abstract class Write<@Covariant T> extends Encode<T> {

  /**
   * Constructs a {@code Write} instance in the {@code write-cont} state.
   */
  protected Write() {
    // nop
  }

  /**
   * Returns {@code true} when in the {@code write-cont} state,
   * ready to {@linkplain #produce(Output) produce} more output.
   *
   * @return whether or not this {@code Write} instance is
   *         in the {@code write-cont} state
   */
  @Override
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when in the {@code write-done} state,
   * having terminated with a {@linkplain #get() written value}.
   *
   * @return whether or not this {@code Write} instance is
   *         in the {@code write-done} state
   */
  @Override
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when in the {@code write-error} state,
   * having terminated with a {@linkplain #getError() write error}.
   *
   * @return whether or not this {@code Write} instance is
   *         in the {@code write-error} state
   */
  @Override
  public boolean isError() {
    return false;
  }

  /**
   * Writes an {@code output} chunk and returns a new {@code Write} instance
   * representing the updated state of the write operation. If the output
   * enters the {@link Output#isDone() output-done} state, then {@code produce}
   * <em>must</em> return a terminated {@code Write} instance in either the
   * {@code write-done} state or the {@code write-error} state. The given
   * {@code output} is only guaranteed to be valid for the duration of the
   * method call; references to {@code output} should not be retained.
   *
   * @param output the output in which to write an output chunk
   * @return the continuation of the write operation
   */
  public abstract Write<T> produce(Output<?> output);

  @Override
  public Write<T> produce(OutputBuffer<?> output) {
    return this.produce((Output<?>) output);
  }

  /**
   * Provides an opportunity for the {@code Write} instance to propagate
   * backpressure to the caller. Returns {@code true} if the {@code Write}
   * instance will invoke {@link OutputFuture#requestOutput() future.requestOutput()}
   * when it's ready to produce more output; otherwise returns {@code false}
   * if the {@code Write} instance is currently ready to produce more output.
   * The default implementation returns {@code false}.
   * <p>
   * After {@code backoff} returns {@code true}, but before {@code
   * future.requestOutput()} is called, the {@code Write} instance enters the
   * implicit {@code write-backoff} state. Once in the {@code write-backoff}
   * state, it is responsibility of the {@code Write} instance to ensure that
   * {@code future.requestOutput()} eventually gets called.
   * <p>
   * Write backoff is advisory. A writer may invoke {@code produce}
   * at any time. Even backpressure-aware writers may disregard the
   * {@code write-backoff} state and invoke {@code produce} with a
   * terminated output in order to terminate a write operation.
   * <p>
   * Consider the example of a proxy stream that parses one input,
   * and writes another output. There's no point invoking {@code produce}
   * on the write end of the stream if the parse end's input is empty.
   * Such a stream can wait for input to become available before calling
   * {@code future.requestOutput()}.
   *
   * @param future an output future that will trigger an invocation of
   *        {@code produce} after its {@code requestOutput} method is called
   * @return whether or not the writer should wait to invoke {@code produce}
   *         until after {@code future.requestOutput()} is called
   */
  @Override
  public boolean backoff(OutputFuture future) {
    return false;
  }

  /**
   * Returns the written value, if in the {@code write-done} state;
   * otherwise throws an exception. Subclasses may optionally return
   * a value in other states.
   *
   * @return the written value, if available
   * @throws WriteException if in the {@code write-error} state
   * @throws IllegalStateException if in the {@code write-cont} state
   */
  @CheckReturnValue
  @Override
  public @Nullable T get() throws WriteException {
    throw new IllegalStateException("incomplete write");
  }

  /**
   * Returns the written value, if in the {@code write-done} state and
   * the written value is not {@code null}; otherwise throws an exception.
   * Subclasses may optionally return a non-{@code null} value in other states.
   * The default implementation delegates to {@link #get()},
   * {@code null}-checking its return value.
   *
   * @return the written value, if available and not {@code null}
   * @throws WriteException if in the {@code write-error} state
   * @throws IllegalStateException if in the {@code write-cont} state
   * @throws NullPointerException if the written value is {@code null}
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() throws WriteException {
    final T value = this.get();
    if (value == null) {
      throw new NullPointerException("written value is null");
    }
    return value;
  }

  /**
   * Returns the written value, if in the {@code write-done} state;
   * otherwise throws an unchecked exception. Subclasses may optionally
   * return a value in other states. The default implementation delegates
   * to {@link #get()}, catching any {@code WriteException} and rethrowing
   * it as the cause of a {@code NoSuchElementException}.
   *
   * @return the written value, if available
   * @throws NoSuchElementException if in the {@code write-error} state
   * @throws IllegalStateException if in the {@code write-cont} state
   */
  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    try {
      return this.get();
    } catch (WriteException cause) {
      throw new NoSuchElementException("write error", cause);
    }
  }

  /**
   * Returns the written value, if in the {@code write-done} state and
   * the written value is not {@code null}; otherwise throws an unchecked
   * exception. Subclasses may optionally return a non-{@code null} value
   * in other states. The default implementation delegates to
   * {@link #getNonNull()}, catching any {@code WriteException}
   * and rethrowing it as the cause of a {@code NoSuchElementException}.
   *
   * @return the written value, if available and not {@code null}
   * @throws NoSuchElementException if in the {@code write-error} state
   * @throws IllegalStateException if in the {@code write-cont} state
   * @throws NullPointerException if the written value is {@code null}
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    try {
      return this.getNonNull();
    } catch (WriteException cause) {
      throw new NoSuchElementException("write error", cause);
    }
  }

  /**
   * Returns the written value, if in the {@code write-done} state;
   * otherwise returns some {@code other} value. The default implementation
   * delegates to {@link #get()}, catching any {@code WriteException}
   * or {@code IllegalStateException} to instead return {@code other}.
   *
   * @param other returned when a written value is not available
   * @return either the written value, or the {@code other} value
   */
  @CheckReturnValue
  @Override
  public @Nullable T getOr(@Nullable T other) {
    try {
      return this.get();
    } catch (WriteException | IllegalStateException cause) {
      return other;
    }
  }

  /**
   * Returns the written value, if in the {@code write-done} state
   * and the written value is not {@code null}; otherwise returns some
   * non-{@code null} {@code other}. The default implementation delegates
   * to {@link #getNonNull()}, catching any {@code WriteException},
   * {@code IllegalStateException}, or {@code NullPointerException}
   * to instead {@code null}-check and return the {@code other} value.
   *
   * @param other non-{@code null} value returned when
   *        the written value is {@code null} or not available
   * @return either the non-{@code null} written value,
   *         or the non-{@code null} {@code other} value
   * @throws NullPointerException if the written value and
   *         the {@code other} value are both {@code null}
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOr(@NonNull T other) {
    try {
      return this.getNonNull();
    } catch (WriteException | IllegalStateException | NullPointerException cause) {
      if (other == null) {
        throw new NullPointerException("other value is null");
      }
      return other;
    }
  }

  /**
   * Returns the written value, if in the {@code write-done} state;
   * otherwise returns the value returned by the given {@code supplier}
   * function. The default implementation delegates to {@link #get()},
   * catching any {@code WriteException} or {@code IllegalStateException}
   * to instead return the value returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a return value when
   *        a written value is not available
   * @return either the written value, or the value returned
   *         by the {@code supplier} function
   */
  @CheckReturnValue
  @Override
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    try {
      return this.get();
    } catch (WriteException | IllegalStateException cause) {
      return supplier.get();
    }
  }

  /**
   * Returns the written value, if in the {@code write-done} state and
   * the written value is not {@code null}; otherwise returns the
   * non-{@code null} value returned by the given {@code supplier} function.
   * The default implementation delegates to {@link #getNonNull()},
   * catching any {@code WriteException}, {@code IllegalStateException},
   * or {@code NullPointerException} to instead {@code null}-check and
   * return the value returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a non-{@code null} return value
   *        when the written value is {@code null} or not available
   * @return either the non-{@code null} written value, or the
   *         non-{@code null} value returned by the {@code supplier} function
   * @throws NullPointerException if the written value and the value returned
   *         by the {@code supplier} function are both {@code null}
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOrElse(Supplier<? extends T> supplier) {
    try {
      return this.getNonNull();
    } catch (WriteException | IllegalStateException | NullPointerException cause) {
      final T value = supplier.get();
      if (value == null) {
        throw new NullPointerException("supplied value is null");
      }
      return value;
    }
  }

  /**
   * Returns the write error, if in the {@code write-error} state;
   * otherwise throws an unchecked exception.
   *
   * @return the write error, if present
   * @throws IllegalStateException if not in the {@code write-error} state
   */
  @CheckReturnValue
  @Override
  public Throwable getError() {
    throw new IllegalStateException("no write error");
  }

  /**
   * Casts this {@code Write} instance to a different written value type,
   * if in the {@code write-error} state; otherwise throws an unchecked
   * exception. {@code Write} instances in the {@code write-error} state
   * are bi-variant with respect to their written value type since they
   * never actually return a written value.
   * <p>
   * If not already in the {@code write-error} state, returns a new
   * {@code Write} instance in the {@code write-error} state that
   * wraps an {@code IllegalStateException}.
   *
   * @return {@code this}, if in the {@code write-error} state
   */
  @Override
  public <T2> Write<T2> asError() {
    return Write.error(new IllegalStateException("incomplete write"));
  }

  /**
   * Throws a checked exception if in the {@code write-error} state,
   * otherwise returns {@code this}. If in the {@code write-error} state
   * and the write error is an instance of {@code WriteException},
   * the write error is rethrown; otherwise a new {@code WriteException}
   * is thrown with the write error as its cause.
   *
   * @return {@code this}, if not in the {@code write-error} state
   * @throws WriteException if in the {@code write-error} state
   */
  @Override
  public Write<T> checkError() throws WriteException {
    return this;
  }

  /**
   * Throws a checked exception if not in the {@code write-done} state,
   * otherwise returns {@code this}. If in the {@code write-error} state
   * and the write error is an instance of {@code WriteException},
   * the write error is rethrown; otherwise a new {@code WriteException}
   * is thrown with the write error as its cause. If in the
   * {@code write-cont} state, a new {@code WriteException}
   * is thrown to indicate an incomplete write.
   *
   * @return {@code this}, if in the {@code write-done} state
   * @throws WriteException if not in the {@code write-done} state
   */
  @Override
  public Write<T> checkDone() throws WriteException {
    throw new WriteException("incomplete write");
  }

  /**
   * Throws an {@link AssertionError} if not in the {@code write-done} state,
   * otherwise returns {@code this}. The {@code AssertionError} will set the
   * write error as its cause, if in the {@code write-error} state.
   *
   * @return {@code this}, if in the {@code write-done} state
   * @throws AssertionError if not in the {@code write-done} state
   */
  @Override
  public Write<T> assertDone() {
    throw new AssertionError("incomplete write");
  }

  /**
   * Returns a {@code Write} instance that continues writing {@code that}
   * after it finishes writing {@code this}.
   *
   * @param that the {@code Write} instance to write after {@code this}
   * @return a {@code Write} instance that writes {@code this},
   *         followed by {@code that}
   */
  public <T2> Write<T2> andThen(Write<T2> that) {
    Objects.requireNonNull(that);
    return new WriteAndThen<T2>(this, that);
  }

  @CheckReturnValue
  @Override
  public <U> Write<U> map(Function<? super T, ? extends U> mapper) {
    return new WriteMapper<T, U>(this, mapper);
  }

  /**
   * Converts this {@code Write} instance to a {@link Result}. {@code Write}
   * states map to {@code Result} states according to the following rules:
   * <ul>
   * <li>Returns an {@link Result#ok(Object) ok result} containing
   *     the decoded value when in the {@code write-done} state
   * <li>Returns an {@link Result#error(Throwable) error result} wrapping
   *     the write error when in the {@code write-error} state
   * <li>Returns an {@code error result} wrapping an
   *     {@code IllegalStateException} when in the {@code write-cont} state
   * </ul>
   *
   * @return the result of this write operation
   */
  @CheckReturnValue
  @Override
  public Result<T> toResult() {
    try {
      return Result.ok(this.get());
    } catch (WriteException | IllegalStateException cause) {
      return Result.error(cause);
    }
  }

  /**
   * Singleton {@code Write} instance in the {@code write-done} state
   * containing a {@code null} written value.
   */
  private static final Write<Object> DONE = new WriteDone<Object>(null);

  /**
   * Returns a {@code Write} instance in the {@code write-done} state
   * containing a {@code null} written value. Always returns the same
   * singleton {@code Write} instance.
   *
   * @return a singleton {@code Write} instance in the {@code write-done}
   *         state containing a {@code null} written value
   */
  @CheckReturnValue
  public static <T> Write<T> done() {
    return Assume.conforms(DONE);
  }

  /**
   * Returns a {@code Write} instance in the {@code write-done} state
   * containing the given written {@code value}. If {@code value} is
   * {@code null}, returns the singleton {@link Write#done()} instance.
   *
   * @param value the written value to be contained by
   *        the returned {@code Write} instance
   * @return a {@code Write} instance in the {@code write-done} state
   *         containing the written {@code value}
   */
  @CheckReturnValue
  public static <T> Write<T> done(@Nullable T value) {
    if (value != null) {
      return new WriteDone<T>(value);
    } else {
      return Assume.conforms(DONE);
    }
  }

  /**
   * Returns a {@code Write} instance in the {@code write-error} state
   * that wraps the given write {@code error}.
   *
   * @param error the write error to be wrapped by
   *        the returned {@code Write} instance
   * @return a {@code Write} instance in the {@code write-error} state
   *         that wraps the write {@code error}
   */
  @CheckReturnValue
  public static <T> Write<T> error(Throwable error) {
    Objects.requireNonNull(error);
    return new WriteError<T>(error);
  }

}

final class WriteDone<@Covariant T> extends Write<T> implements WriteSource {

  private final @Nullable T value;

  WriteDone(@Nullable T value) {
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
  public Write<T> produce(Output<?> output) {
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
    if (this.value == null) {
      throw new NullPointerException("written value is null");
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
      throw new NullPointerException("written value is null");
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
  public Write<T> checkDone() {
    return this;
  }

  @Override
  public Write<T> assertDone() {
    return this;
  }

  @Override
  public <T2> Write<T2> andThen(Write<T2> that) {
    Objects.requireNonNull(that);
    return that;
  }

  @CheckReturnValue
  @Override
  public <U> Write<U> map(Function<? super T, ? extends U> mapper) {
    try {
      return Write.done(mapper.apply(this.value));
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Write.error(cause);
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
    } else if (other instanceof WriteDone<?> that) {
      return Objects.equals(this.value, that.value);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WriteDone.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.value)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Write", "done");
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

final class WriteError<@Covariant T> extends Write<T> implements WriteSource {

  private final Throwable error;

  WriteError(Throwable error) {
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
  public Write<T> produce(Output<?> output) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() throws WriteException {
    if (this.error instanceof WriteException) {
      throw (WriteException) this.error;
    } else {
      throw new WriteException("write failed", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() throws WriteException {
    if (this.error instanceof WriteException) {
      throw (WriteException) this.error;
    } else {
      throw new WriteException("write failed", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    throw new NoSuchElementException("write failed", this.error);
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    throw new NoSuchElementException("write failed", this.error);
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
  public <T2> Write<T2> asError() {
    return Assume.conforms(this);
  }

  @Override
  public Write<T> checkError() throws WriteException {
    if (this.error instanceof WriteException) {
      throw (WriteException) this.error;
    } else {
      throw new WriteException("write failed", this.error);
    }
  }

  @Override
  public Write<T> checkDone() throws WriteException {
    if (this.error instanceof WriteException) {
      throw (WriteException) this.error;
    } else {
      throw new WriteException("write failed", this.error);
    }
  }

  @Override
  public Write<T> assertDone() {
    throw new AssertionError("write failed", this.error);
  }

  @Override
  public <T2> Write<T2> andThen(Write<T2> that) {
    Objects.requireNonNull(that);
    return Assume.conforms(this);
  }

  @CheckReturnValue
  @Override
  public <U> Write<U> map(Function<? super T, ? extends U> mapper) {
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
    } else if (other instanceof WriteError<?> that) {
      return this.error.equals(that.error);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WriteError.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.error.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Write", "error")
            .appendArgument(this.error)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class WriteAndThen<@Covariant T> extends Write<T> implements WriteSource {

  private final Write<?> head;
  private final Write<T> tail;

  WriteAndThen(Write<?> head, Write<T> tail) {
    this.head = head;
    this.tail = tail;
  }

  @Override
  public Write<T> produce(Output<?> output) {
    final Write<?> head = this.head.produce(output);
    if (head.isDone()) {
      return this.tail;
    } else if (head.isError()) {
      return head.asError();
    }
    return new WriteAndThen<T>(head, this.tail);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WriteAndThen<?> that) {
      return this.head.equals(that.head)
          && this.tail.equals(that.tail);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WriteAndThen.class);

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
    return WriteSource.toString(this);
  }

}

final class WriteMapper<S, T> extends Write<T> implements WriteSource {

  final Write<S> write;
  final Function<? super S, ? extends T> mapper;

  WriteMapper(Write<S> write, Function<? super S, ? extends T> mapper) {
    this.write = write;
    this.mapper = mapper;
  }

  @Override
  public Write<T> produce(Output<?> output) {
    return this.write.produce(output).map(this.mapper);
  }

  @Override
  public <U> Write<U> map(Function<? super T, ? extends U> mapper) {
    return new WriteMapper<S, U>(this.write, this.mapper.andThen(mapper));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.write)
            .beginInvoke("map")
            .appendArgument(this.mapper)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
