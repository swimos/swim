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

package swim.util;

import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Stream;
import swim.annotations.CheckReturnValue;
import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * The result of an operation; either an <em>ok</em> value of type {@code T},
 * or a {@code Throwable} <em>error</em>. Results are used to model the return
 * values of functions, including exceptional returns.
 *
 * <h2>Ok results</h2>
 * <p>
 * An <em>ok</em> result wraps an arbitrary nullable value of type {@code T}.
 * Ok results are constructed via the {@link #ok(Object) Result.ok(T)} factory
 * method. All {@code null}-valued results are represented by the singleton
 * {@link #empty() Result.empty()} result.
 * <p>
 * The {@link #isOk()} method returns {@code true} if and only if the result
 * wraps a nullable value of type {@code T}; the resulting value can be
 * obtained by calling the {@link #get()} method. The {@link #getOr(Object)
 * getOr(T)} method can be used to unwrap a resulting value if the result
 * is ok, or return a default value if the result is an error. Alternatively,
 * the {@link #getOrElse(Supplier)} method can be used to unwrap a resulting
 * value if the result is ok, or return the evaluation of a {@code Supplier}
 * function if the result is an error.
 *
 * <h2>Error results</h2>
 * <p>
 * An <em>error</em> result wraps a non-null {@code Throwable} exception.
 * Error results are constructed via the {@link #error(Throwable)
 * Result.error(Throwable)} factory method.
 * <p>
 * The {@link #isError()} method returns {@code true} if and only if the result
 * is an error; the underlying {@code Throwable} error can be obtained by
 * calling the {@link #getError()} method.
 * <p>
 * {@code Result} uses an internal flag to discriminate between ok results
 * and error results, so no ambiguity arises from constructing an ok result
 * containing an instance of {@code Throwable}.
 *
 * <h2>Conversions</h2>
 * <p>
 * The {@link #ok()} method converts a {@code Result} to an {@link Optional}
 * containing the resulting value or an empty optional. The {@link #error()}
 * method converts a {@code Result} to an {@code Optional} containing
 * the resulting error or an empty optional. The {@link #stream()} method
 * converts a {@code Result} to a {@link Stream} containing just the resulting
 * value or an empty stream.
 *
 * <h2>Combinators</h2>
 * <p>
 * Results can be {@linkplain #map(Function) mapped}, {@linkplain
 * #flatMap(Function) flat mapped}, {@linkplain #mapError(Function)
 * error mapped}, {@linkplain #recover(Function) recovered}, and
 * {@linkplain #recoverWith(Function) partially recovered}.
 * <p>
 * The {@link #of(Supplier) Result.of(Supplier)} factory method returns the
 * result of invoking a {@code Supplier} function, wrapping any non-{@linkplain
 * #isFatal(Throwable) fatal} exceptions thrown by the function.
 *
 * <h2>Exceptions</h2>
 * <p>
 * Except as otherwise noted, all non-{@linkplain #isFatal(Throwable) fatal}
 * exceptions thrown by combinator functions are caught and returned as error
 * results. Fatal exceptions thrown by combinator functions always propagate
 * to the caller.
 */
@Public
@Since("5.0")
public final class Result<T> implements WriteMarkup, WriteSource {

  /**
   * Either the nullable resulting value of type {@code T}
   * if the {@code ERROR_FLAG} bit is clear, or a non-null
   * {@code Throwable} error if the {@code ERROR_FLAG} bit is set.
   */
  final @Nullable Object value;

  /**
   * A bitfield containing the {@code ERROR_FLAG} bit that discriminates
   * between ok results and error results.
   */
  final int flags;

  /**
   * Constructs a new result with the given {@code value} and {@code flags}.
   * If the {@code ERROR_FLAG} bit is clear, then {@code value}
   * <strong>must</strong> be a nullable instanceof type {@code T}.
   * If the {@code ERROR_FLAG} bit is set, then {@code value}
   * <strong>must</strong> be a non-null instance of {@code Throwable}.
   * <p>
   * All other flag bits are reserved and <strong>must</strong> be clear.
   */
  private Result(@Nullable Object value, int flags) {
    // assert (flags & ~ERROR_FLAG) == 0;
    // if ((flags & ERROR_FLAG) != 0) assert value instanceof Throwable;
    this.value = value;
    this.flags = flags;
  }

  /**
   * Returns {@code true} if this is an <em>ok</em> result that wraps
   * a nullable value of type {@code T}; otherwise returns {@code false}.
   * If {@code true}, the resulting value can be obtained by calling
   * the {@link #get()} method.
   */
  public boolean isOk() {
    return (this.flags & ERROR_FLAG) == 0;
  }

  /**
   * Returns {@code true} if this is an <em>error</em> result that wraps
   * a {@code Throwable} exception; otherwise returns {@code false}.
   * If {@code true}, the resulting error can be obtained by calling
   * the {@link #getError()} method.
   */
  public boolean isError() {
    return (this.flags & ERROR_FLAG) != 0;
  }

  /**
   * Returns the resulting value, if this is an {@linkplain #isOk() ok result};
   * otherwise throws {@link IllegalStateException}.
   *
   * @throws IllegalStateException if this is an {@linkplain #isError() error result}.
   */
  @CheckReturnValue
  public @Nullable T get() {
    if (this.isError()) {
      throw new IllegalStateException("error result", (Throwable) this.value);
    }
    return Assume.conformsNullable(this.value);
  }

  /**
   * Returns the resulting value, if this is an {@linkplain #isOk() ok result}
   * and the resulting value is non-{@code null}.
   *
   * @throws IllegalStateException if this is an {@linkplain #isError() error result}.
   * @throws NullPointerException if the resulting value is {@code null}.
   */
  @CheckReturnValue
  public @NonNull T getNonNull() {
    if (this.isError()) {
      throw new IllegalStateException("error result", (Throwable) this.value);
    } else if (this.value == null) {
      throw new NullPointerException("null result");
    }
    return Assume.conforms(this.value);
  }

  /**
   * Returns the resulting value, if this is an {@linkplain #isOk() ok result};
   * otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  public @Nullable T getOr(@Nullable T other) {
    if (this.isOk()) {
      return Assume.conformsNullable(this.value);
    }
    return other;
  }

  /**
   * Returns the resulting value, if this is an {@linkplain #isOk() ok result}
   * and the resulting value is non-{@code null}; otherwise returns some
   * {@code other} value.
   */
  @CheckReturnValue
  public @NonNull T getNonNullOr(@NonNull T other) {
    if (this.isOk() && this.value != null) {
      return Assume.conforms(this.value);
    }
    return other;
  }

  /**
   * Returns the resulting value, if this is an {@linkplain #isOk() ok result};
   * otherwise returns the value produced by the given {@code supplier} function.
   */
  @CheckReturnValue
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    if (this.isOk()) {
      return Assume.conformsNullable(this.value);
    }
    return supplier.get();
  }

  /**
   * Returns the resulting value, if this is an {@linkplain #isOk() ok result}
   * and the resulting value is non-{@code null}; otherwise returns the
   * non-{@code null} value produced by the given {@code supplier} function.
   *
   * @throws NullPointerException if the resulting value and the value produced
   *         by the {@code supplier} function are both {@code null}.
   */
  @CheckReturnValue
  public @NonNull T getNonNullOrElse(Supplier<? extends T> supplier) {
    if (this.isOk()) {
      return Assume.conformsNonNull(this.value);
    }
    final T value = supplier.get();
    if (value == null) {
      throw new NullPointerException("null supplier result");
    }
    return value;
  }

  /**
   * Returns the resulting error, if this is an {@linkplain #isError()
   * error result}; otherwise throws an {@link IllegalStateException}.
   *
   * @throws IllegalStateException if this is an {@linkplain #isOk() ok result}.
   */
  @CheckReturnValue
  public Throwable getError() {
    if (this.isOk()) {
      throw new IllegalStateException("ok result");
    }
    return (Throwable) Assume.nonNull(this.value);
  }

  /**
   * Returns {@code true} if this is an {@linkplain #isOk() ok result}
   * and the resulting value is equal to the given {@code value};
   * otherwise returns {@code false}.
   */
  @CheckReturnValue
  public boolean contains(@Nullable Object value) {
    return this.isOk() && Objects.equals(value, this.value);
  }

  /**
   * Returns an {@code Optional} containing the resulting value, if this
   * is an {@linkplain #isOk() ok result}; otherwise returns an empty
   * {@code Optional}. Note that because optionals cannot contain
   * {@code null} values, both {@code null} results and error results
   * convert to an empty @code Optional}.
   */
  @CheckReturnValue
  public Optional<T> ok() {
    if (this.isError()) {
      return Optional.empty();
    }
    return Optional.ofNullable(Assume.conformsNullable(this.value));
  }

  /**
   * Returns an {@code Optional} containing the resulting error, if this
   * is an {@linkplain #isError() error result}; otherwise returns an empty
   * {@code Optional}.
   */
  @CheckReturnValue
  public Optional<Throwable> error() {
    if (this.isOk()) {
      return Optional.empty();
    }
    return Optional.of((Throwable) Assume.nonNull(this.value));
  }

  /**
   * Returns a {@code Stream} containing just the resulting value, if this is an
   * {@linkplain #isOk() ok result}; otherwise returns an empty {@code Stream}.
   */
  @CheckReturnValue
  public Stream<T> stream() {
    if (this.isError()) {
      return Stream.empty();
    }
    return Stream.of(Assume.conformsNullable(this.value));
  }

  /**
   * Returns the ok result of applying a {@code mapper} function to the
   * resulting value, if this is an {@linkplain #isOk() ok result};
   * otherwise returns this error result. Returns am error result containing
   * any non-fatal exception thrown by the {@code mapper} function;
   * {@linkplain #isFatal(Throwable) fatal} exceptions thrown by the
   * {@code mapper} function propagate to the caller.
   */
  @CheckReturnValue
  public <U> Result<U> map(Function<? super T, ? extends U> mapper) {
    if (this.isError()) {
      return Assume.conforms(this);
    }
    try {
      return Result.ok(mapper.apply(Assume.conformsNullable(this.value)));
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Result.error(cause);
    }
  }

  /**
   * Returns the result of applying a {@code Result}-returning {@code mapper}
   * function to the resulting value, if this is an {@linkplain #isOk()
   * ok result}; otherwise returns this error result. Returns am error result
   * containing any non-fatal exception thrown by the {@code mapper} function;
   * {@linkplain #isFatal(Throwable) fatal} exceptions thrown by the
   * {@code mapper} function propagate to the caller.
   */
  @CheckReturnValue
  public <U> Result<U> flatMap(Function<? super T, ? extends Result<? extends U>> mapper) {
    if (this.isError()) {
      return Assume.conforms(this);
    }
    try {
      return Assume.conforms(mapper.apply(Assume.conformsNullable(this.value)));
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Result.error(cause);
    }
  }

  /**
   * Returns the error result of applying a {@code mapper} function to the
   * resulting error, if this is an {@linkplain #isError() error result};
   * otherwise returns this ok result. Returns am error result containing
   * any non-fatal exception thrown by the {@code mapper} function;
   * {@linkplain #isFatal(Throwable) fatal} exceptions thrown by the
   * {@code mapper} function propagate to the caller.
   */
  @CheckReturnValue
  public Result<T> mapError(Function<? super Throwable, ? extends Throwable> mapper) {
    if (this.isOk()) {
      return this;
    }
    try {
      return Result.error(mapper.apply((Throwable) this.value));
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Result.error(cause);
    }
  }

  /**
   * Returns the ok result of applying a {@code recovery} function to the
   * resulting error, if this is an {@linkplain #isError() error result};
   * otherwise returns this ok result. Returns am error result containing
   * any non-fatal exception thrown by the {@code recovery} function;
   * {@linkplain #isFatal(Throwable) fatal} exceptions thrown by the
   * {@code recovery} function propagate to the caller.
   */
  @CheckReturnValue
  public Result<T> recover(Function<? super Throwable, ? extends T> recovery) {
    if (this.isOk()) {
      return this;
    }
    try {
      return Result.ok(recovery.apply((Throwable) this.value));
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Result.error(cause);
    }
  }

  /**
   * Returns the result of applying a {@code Result}-returning {@code recovery}
   * function to the resulting error, if this is an {@linkplain #isError()
   * error result}; otherwise returns this ok result. Returns am error result
   * containing any non-fatal exception thrown by the {@code recovery} function;
   * {@linkplain #isFatal(Throwable) fatal} exceptions thrown by the
   * {@code recovery} function propagate to the caller.
   */
  @CheckReturnValue
  public Result<T> recoverWith(Function<? super Throwable, ? extends Result<? extends T>> recovery) {
    if (this.isOk()) {
      return this;
    }
    try {
      return Assume.conforms(recovery.apply((Throwable) this.value));
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Result.error(cause);
    }
  }

  /**
   * Returns this result, if it's an {@linkplain #isOk() ok result};
   * otherwise returns some {@code other} result.
   */
  @CheckReturnValue
  public Result<T> or(Result<? extends T> other) {
    if (this.isOk()) {
      return this;
    }
    return Assume.conforms(other);
  }

  /**
   * Returns this result, if it's an {@linkplain #isOk() ok result};
   * otherwise returns the result of invoking a {@code Result}-returning
   * {@code supplier} function. Returns am error result containing any
   * non-fatal exception thrown by the {@code supplier} function;
   * {@linkplain #isFatal(Throwable) fatal} exceptions thrown by the
   * {@code supplier} function propagate to the caller.
   */
  @CheckReturnValue
  public Result<T> orElse(Supplier<? extends Result<? extends T>> supplier) {
    if (this.isOk()) {
      return this;
    }
    try {
      return Assume.conforms(supplier.get());
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Result.error(cause);
    }
  }

  @CheckReturnValue
  public <U> Result<U> asError() {
    if (this.isOk()) {
      return Result.error(new IllegalStateException("ok result"));
    }
    return Assume.conforms(this);
  }

  /**
   * Returns {@code true} if some {@code other} object is equal to this result.
   * The other object is considered equal to this result if:
   * <ul>
   * <li>both instances are ok, and the resulting values are either both
   * {@code null}, or are {@link Object#equals(Object) equal} to each other.
   * <li>both instances are errors, and the resulting errors are
   * {@link Object#equals(Object) equal} to each other.
   * </ul>
   */
  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Result<?> that) {
      return this.flags == that.flags
          && Objects.equals(this.value, that.value);
    }
    return false;
  }

  /**
   * Returns the hash code of the resulting value, if this is an {@linkplain
   * #isOk() ok result}; otherwise returns the hash code of the resulting
   * error xor {@code 1}.
   */
  @Override
  public int hashCode() {
    return Objects.hashCode(this.value) ^ this.flags;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isOk()) {
      if (this.value == null) {
        notation.beginInvoke("Result", "empty").endInvoke();
      } else {
        notation.beginInvoke("Result", "ok")
                .appendArgument(this.value)
                .endInvoke();
      }
    } else {
      notation.beginInvoke("Result", "error")
              .appendArgument(this.value)
              .endInvoke();
    }
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isOk()) {
      notation.green();
    } else {
      notation.red();
    }
    notation.appendMarkup(this.value);
    notation.reset();
  }

  /**
   * Returns a string representation of this result.
   */
  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  /**
   * Bit flag used to discriminate between ok results and error results.
   */
  static final int ERROR_FLAG = 1 << 0;

  /**
   * Singleton instance used to represent all {@code null} results.
   */
  static final Result<Object> EMPTY = new Result<Object>(null, 0);

  /**
   * Returns an ok result containing a {@code null} value.
   * Always returns the same singleton instance.
   */
  @CheckReturnValue
  public static <T> Result<T> empty() {
    return Assume.conforms(EMPTY);
  }

  /**
   * Returns an ok result containing a nullable {@code value}.
   * If {@code value} is {@code null}, the singleton {@linkplain #empty()
   * empty result} is returned.
   */
  @CheckReturnValue
  public static <T> Result<T> ok(@Nullable T value) {
    if (value == null) {
      return Assume.conforms(EMPTY);
    }
    return new Result<T>(value, 0);
  }

  /**
   * Returns an error result containing a non-null {@code error}.
   */
  @CheckReturnValue
  public static <T> Result<T> error(Throwable error) {
    Objects.requireNonNull(error, "error");
    return new Result<T>(error, ERROR_FLAG);
  }

  /**
   * Returns the result of invoking a {@code supplier} function.
   * Returns am error result containing any non-fatal exception thrown by
   * the {@code supplier} function; {@linkplain #isFatal(Throwable) fatal}
   * exceptions thrown by the {@code supplier} function propagate to the caller.
   */
  @CheckReturnValue
  public static <T> Result<T> of(Supplier<T> supplier) {
    try {
      return Result.ok(supplier.get());
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Result.error(cause);
    }
  }

  /**
   * Returns {@code true} if {@code error} is a fatal exception; otherwise
   * returns {@code false} if {@code error} is a recoverable exception.
   */
  @CheckReturnValue
  public static boolean isFatal(Throwable error) {
    return error instanceof InterruptedException
        || error instanceof LinkageError
        || error instanceof ThreadDeath
        || (error instanceof VirtualMachineError && !(error instanceof StackOverflowError));
  }

  /**
   * Throws {@code error} if and only if {@code error} is {@linkplain #isFatal(Throwable) fatal}.
   *
   * @param error the exception to throw, if fatal
   */
  public static void throwFatal(Throwable error) {
    if (error instanceof InterruptedException) {
      Thread.currentThread().interrupt();
    } else if (error instanceof LinkageError) {
      throw (LinkageError) error;
    } else if (error instanceof ThreadDeath) {
      throw (ThreadDeath) error;
    } else if (error instanceof VirtualMachineError && !(error instanceof StackOverflowError)) {
      throw (VirtualMachineError) error;
    }
  }

}
