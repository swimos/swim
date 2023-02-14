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

package swim.util;

import java.util.NoSuchElementException;
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
 * A container for the result of an operation; either a success value
 * of type {@code T}, or a failure with a {@code Throwable} error.
 * {@code Result} objects are used to model the return values of functions,
 * including exceptional returns.
 *
 * <h2>Successes</h2>
 * <p>
 * A <em>success</em> is a result that contains an arbitrary nullable
 * value of type {@code T}. Successful results are constructed via the {@link
 * #success(Object) Result.success(T)} factory method. All {@code null}
 * results are represented by the singleton {@link #empty() empty} result.
 * <p>
 * The {@link #isSuccess()} method returns {@code true} if, and only if,
 * the result is a success. The resulting value can be obtained via the
 * {@link #get()} method. The {@link #getOr(Object) getOr(T)} method can be
 * used to unwrap resulting value, or return a default value if the result
 * is a failure. Alternatively, the {@link #getOrElse(Supplier)} method can
 * be used to unwrap a resulting value, or return the evaluation of a {@code
 * Supplier} function if the result is a failure.
 *
 * <h2>Failures</h2>
 * <p>
 * A <em>failure</em> is a result that contains a non-null {@code Throwable}
 * exception. Failed results are constructed via the {@link #failure(Throwable)
 * Result.failure(Throwable)} factory method.
 * <p>
 * The {@link #isFailure()} method returns {@code true} if, and only if,
 * the result is a failure. The resulting {@code Throwable} error can be
 * obtained via the {@link #getError()} method.
 * <p>
 * {@code Result} uses an internal flag to discriminate between successes
 * and failures, so no ambiguity arises from constructing a success result
 * containing an instance of {@code Throwable}.
 *
 * <h2>Conversions</h2>
 * <p>
 * The {@link #success()} method converts a result to an {@link Optional}
 * containing the resulting value, if the result is a success. The {@link
 * #failure()} method converts a result to an {@code Optional} containing
 * the resulting error, if the result is a failure. And the {@link #stream()}
 * method converts a result to a {@link Stream} containing just the resulting
 * value, if the result is a success.
 *
 * <h2>Combinators</h2>
 * <p>
 * Results can be {@linkplain #map(Function) mapped}, {@linkplain
 * #flatMap(Function) flat mapped}, {@linkplain #mapFailure(Function)
 * failure mapped}, {@linkplain #recover(Function) recovered}, {@linkplain
 * #recoverWith(Function) partially recovered}, and more.
 * <p>
 * The {@link #of(Supplier) Result.of(Supplier)} factory method returns
 * the result produced by a {@code Supplier} function, wrapping any
 * {@linkplain #isNonFatal(Throwable) non-fatal exceptions} thrown
 * in the process.
 *
 * <h2>Exceptions</h2>
 * <p>
 * Except as otherwise noted, all {@linkplain #isNonFatal(Throwable)
 * non-fatal exceptions} thrown by combinator functions are caught and
 * returned as failure results. Fatal exceptions thrown by combinator
 * functions always propagate to the caller.
 */
@Public
@Since("5.0")
public final class Result<T> implements ToMarkup, ToSource {

  /**
   * Either the nullable resulting value of type {@code T},
   * if the {@code FAILURE_FLAG} bit is clear, or a non-null
   * {@code Throwable} error, if the {@code FAILURE_FLAG} bit is set.
   */
  private final @Nullable Object value;

  /**
   * A bitfield containing a {@code FAILURE_FLAG} bit that discriminates
   * between successes and failures.
   */
  private final int flags;

  /**
   * Constructs a new result with the given {@code value} and {@code flags}.
   * If the {@code FAILURE_FLAG} bit is clear, then {@code value}
   * <strong>must</strong> contain a nullable instanceof type {@code T}.
   * If the {@code FAILURE_FLAG} bit is set, then {@code value}
   * <strong>must</strong> contain a non-null instanceof {@code Throwable}.
   * <p>
   * All other flag bits are reserved, and <strong>must</strong> be clear.
   */
  private Result(@Nullable Object value, int flags) {
    // assert((flags & ~FAILURE_FLAG) == 0);
    // if ((flags & FAILURE_FLAG) != 0) assert(value instanceof Throwable);
    this.value = value;
    this.flags = flags;
  }

  /**
   * Returns {@code true} if this is result is a <em>success</em>,
   * otherwise returns {@code false}. If {@code true}, the resulting
   * value can be obtained via the {@link #get()} method.
   */
  public boolean isSuccess() {
    return (this.flags & FAILURE_FLAG) == 0;
  }

  /**
   * Returns {@code true} if this result is a <em>failure</em>,
   * otherwise returns {@code false}. If {@code true}, the resulting
   * error can be obtained via the {@link #getError()} method.
   */
  public boolean isFailure() {
    return (this.flags & FAILURE_FLAG) != 0;
  }

  /**
   * Returns the resulting value, if this result {@linkplain #isSuccess()
   * is a success}, otherwise throws {@link NoSuchElementException}.
   *
   * @throws NoSuchElementException if this result {@linkplain #isFailure()
   *         is a failure}.
   */
  @CheckReturnValue
  public @Nullable T get() {
    if (this.isSuccess()) {
      return Assume.conformsNullable(this.value);
    } else {
      throw new NoSuchElementException("Failed result", (Throwable) this.value);
    }
  }

  /**
   * Returns the resulting value, if this result {@linkplain #isSuccess()
   * is a success} and the result value is non-{@code null}.
   *
   * @throws NoSuchElementException if this result {@linkplain #isFailure()
   *         is a failure}.
   * @throws NullPointerException if the result value is {@code null}.
   */
  @CheckReturnValue
  public @NonNull T getNonNull() {
    if (this.isSuccess()) {
      if (this.value != null) {
        return Assume.conforms(this.value);
      } else {
        throw new NullPointerException("Null result");
      }
    } else {
      throw new NoSuchElementException("Failed result", (Throwable) this.value);
    }
  }

  /**
   * Returns the resulting value, if this result {@linkplain #isSuccess()
   * is a success}, otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  public @Nullable T getOr(@Nullable T other) {
    if (this.isSuccess()) {
      return Assume.conformsNullable(this.value);
    } else {
      return other;
    }
  }

  /**
   * Returns the resulting value, if this result {@linkplain #isSuccess()
   * is a success} and the result value is non-{@code null},
   * otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  public @NonNull T getOrNonNull(@NonNull T other) {
    if (this.isSuccess() && this.value != null) {
      return Assume.conforms(this.value);
    } else {
      return other;
    }
  }

  /**
   * Returns the resulting value, if this result {@linkplain #isSuccess()
   * is a success}, otherwise returns the value produced by the given
   * {@code supplier} function.
   */
  @CheckReturnValue
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    if (this.isSuccess()) {
      return Assume.conformsNullable(this.value);
    } else {
      return supplier.get();
    }
  }

  /**
   * Returns the resulting error, if this result {@linkplain #isFailure()
   * is a failure}, otherwise throws {@link NoSuchElementException}.
   *
   * @throws NoSuchElementException if this result {@linkplain #isSuccess()
   *         is a success}.
   */
  @CheckReturnValue
  public Throwable getError() {
    if (this.isFailure()) {
      return (Throwable) Assume.nonNull(this.value);
    } else {
      throw new NoSuchElementException("Successful result");
    }
  }

  /**
   * Returns {@code true} if this result {@linkplain #isSuccess() is a success},
   * and the resulting value is equal to the given {@code value}; otherwise
   * returns {@code false}.
   */
  public boolean contains(@Nullable Object value) {
    return this.isSuccess() && Objects.equals(value, this.value);
  }

  /**
   * Returns an {@code Optional} containing the resulting value,
   * if this result {@linkplain #isSuccess() is a success};
   * otherwise returns an empty {@code Optional}. Note that,
   * because optionals cannot contain {@code null} values,
   * both null results and failure results convert to
   * an empty {@code Optional}.
   */
  public Optional<T> success() {
    if (this.isSuccess()) {
      return Optional.ofNullable(Assume.conformsNullable(this.value));
    } else {
      return Optional.empty();
    }
  }

  /**
   * Returns an {@code Optional} containing the resulting error,
   * if this result {@linkplain #isFailure() is a failure};
   * otherwise returns an empty {@code Optional}.
   */
  public Optional<Throwable> failure() {
    if (this.isFailure()) {
      return Optional.of((Throwable) Assume.nonNull(this.value));
    } else {
      return Optional.empty();
    }
  }

  /**
   * Returns a {@code Stream} containing just the resulting value,
   * if this result {@linkplain #isSuccess() is a success},
   * otherwise returns an empty {@code Stream}.
   */
  public Stream<T> stream() {
    if (this.isSuccess()) {
      return Stream.of(Assume.conformsNullable(this.value));
    } else {
      return Stream.empty();
    }
  }

  /**
   * If this result is a success, returns the transformation of the resulting
   * value by the given {@code mapper} function in a new success result;
   * otherwise returns this failure result. If {@code mapper} throws a
   * {@linkplain #isNonFatal(Throwable) non-fatal exception}, a failure
   * result containing the caught exception is returned. Fatal exceptions
   * thrown by {@code mapper} propagate to the caller.
   */
  public <U> Result<U> map(Function<? super T, ? extends U> mapper) {
    if (this.isSuccess()) {
      try {
        return Result.success(mapper.apply(Assume.conformsNullable(this.value)));
      } catch (Throwable error) {
        if (Result.isNonFatal(error)) {
          return Result.failure(error);
        } else {
          throw error;
        }
      }
    } else {
      return Assume.conforms(this);
    }
  }

  /**
   * If this result is a success, returns the transformation of the resulting
   * value by the given result-returning {@code mapper} function; otherwise
   * returns this failure result. If {@code mapper} throws a {@linkplain
   * #isNonFatal(Throwable) non-fatal exception}, a failure result containing
   * the caught exception is returned. Fatal exceptions thrown by {@code mapper}
   * propagate to the caller.
   */
  public <U> Result<U> flatMap(Function<? super T, ? extends Result<? extends U>> mapper) {
    if (this.isSuccess()) {
      try {
        return Assume.conforms(mapper.apply(Assume.conformsNullable(this.value)));
      } catch (Throwable error) {
        if (Result.isNonFatal(error)) {
          return Result.failure(error);
        } else {
          throw error;
        }
      }
    } else {
      return Assume.conforms(this);
    }
  }

  /**
   * If this result is a failure, returns the transformation of the resulting
   * error by the given {@code mapper} function in a new failure result;
   * otherwise returns this success result. If {@code mapper} throws a
   * {@linkplain #isNonFatal(Throwable) non-fatal exception}, a failure
   * result containing the caught exception is returned. Fatal exceptions
   * thrown by {@code mapper} propagate to the caller.
   */
  public Result<T> mapFailure(Function<? super Throwable, ? extends Throwable> mapper) {
    if (this.isSuccess()) {
      return this;
    } else {
      try {
        return Result.failure(mapper.apply((Throwable) this.value));
      } catch (Throwable error) {
        if (Result.isNonFatal(error)) {
          return Result.failure(error);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * If this result is a failure, returns the transformation of the resulting
   * error by the given {@code recovery} function in a new success result;
   * otherwise returns this success result. If {@code recovery} throws a
   * {@linkplain #isNonFatal(Throwable) non-fatal exception}, a failure
   * result containing the caught exception is returned. Fatal exceptions
   * thrown by {@code recovery} propagate to the caller.
   */
  public Result<T> recover(Function<? super Throwable, ? extends T> recovery) {
    if (this.isSuccess()) {
      return this;
    } else {
      try {
        return Result.success(recovery.apply((Throwable) this.value));
      } catch (Throwable error) {
        if (Result.isNonFatal(error)) {
          return Result.failure(error);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * If this result is a failure, returns the transformation of the resulting
   * error by the given result-returning {@code recovery} function; otherwise
   * returns this success result. If {@code recovery} throws a {@linkplain
   * #isNonFatal(Throwable) non-fatal exception}, a failure result containing
   * the caught exception is returned. Fatal exceptions thrown by {@code
   * recovery} propagate to the caller.
   */
  public Result<T> recoverWith(Function<? super Throwable, ? extends Result<? extends T>> recovery) {
    if (this.isSuccess()) {
      return this;
    } else {
      try {
        return Assume.conforms(recovery.apply((Throwable) this.value));
      } catch (Throwable error) {
        if (Result.isNonFatal(error)) {
          return Result.failure(error);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Returns this result, if it's a success; otherwise returns
   * some {@code other} result.
   */
  public Result<T> or(Result<? extends T> other) {
    if (this.isSuccess()) {
      return this;
    } else {
      return Assume.conforms(other);
    }
  }

  /**
   * Returns this result, if it's a success; otherwise returns the result
   * produced by the given {@code supplier} function. If {@code supplier}
   * throws a {@linkplain #isNonFatal(Throwable) non-fatal exception},
   * a failure result containing the caught exception is returned.
   * Fatal exceptions thrown by {@code supplier} propagate to the caller.
   */
  public Result<T> orElse(Supplier<? extends Result<? extends T>> supplier) {
    if (this.isSuccess()) {
      return this;
    } else {
      try {
        return Assume.conforms(supplier.get());
      } catch (Throwable error) {
        if (Result.isNonFatal(error)) {
          return Result.failure(error);
        } else {
          throw error;
        }
      }
    }
  }

  public <U> Result<U> asFailure() {
    if (this.isFailure()) {
      return Assume.conforms(this);
    } else {
      return Result.failure(new IllegalStateException("Successful result"));
    }
  }

  /**
   * Returns {@code true} if some {@code other} object is equal to this result.
   * The other object is considered equal to this result if:
   * <ul>
   * <li>both instances are successes, and the resulting values are either
   * both {@code null}, or {@link Object#equals(Object) equal} to each other.
   * <li>both instances are failures, and the resulting errors are
   * {@link Object#equals(Object) equal} to each other.
   * </ul>
   */
  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Result) {
      final Result<?> that = (Result<?>) other;
      return this.flags == that.flags
          && Objects.equals(this.value, that.value);
    }
    return false;
  }

  /**
   * If this result is a success, returns the hash code of the non-null
   * resulting value, or {@code 0} if the resulting value is null;
   * if this result is a failure, returns the hash code of the resulting
   * error xor {@code 1}.
   */
  @Override
  public int hashCode() {
    return Objects.hashCode(this.value) ^ this.flags;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isSuccess()) {
      if (this.value == null) {
        notation.beginInvoke("Result", "empty").endInvoke();
      } else {
        notation.beginInvoke("Result", "success").appendArgument(this.value).endInvoke();
      }
    } else {
      notation.beginInvoke("Result", "failure").appendArgument(this.value).endInvoke();
    }
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isSuccess()) {
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
    return this.toSource();
  }

  /**
   * Bit flag used to discriminate between successes and failures.
   */
  private static final int FAILURE_FLAG = 1 << 0;

  /**
   * Singleton instance used to represent all {@code null} results.
   */
  private static final Result<Object> EMPTY = new Result<Object>(null, 0);

  /**
   * Returns a success result containing a {@code null} value.
   * Returns a singleton instance used to represent all null results.
   */
  public static <T> Result<T> empty() {
    return Assume.conforms(EMPTY);
  }

  /**
   * Returns a success result containing a nullable {@code value}.
   * If {@code value} is {@code null}, the singleton {@linkplain #empty()
   * empty result} is returned.
   */
  public static <T> Result<T> success(@Nullable T value) {
    if (value != null) {
      return new Result<T>(value, 0);
    } else {
      return Assume.conforms(EMPTY);
    }
  }

  /**
   * Returns a failure result containing a non-null {@code error}.
   */
  public static <T> Result<T> failure(Throwable error) {
    Objects.requireNonNull(error);
    return new Result<T>(error, FAILURE_FLAG);
  }

  /**
   * Returns a success result containing the value produced by the given
   * {@code supplier} function. If {@code supplier} throws a {@linkplain
   * #isNonFatal(Throwable) non-fatal exception}, a failure result
   * containing the caught exception is returned. Fatal exceptions
   * thrown by {@code supplier} propagate to the caller.
   */
  public static <T> Result<T> of(Supplier<T> supplier) {
    try {
      return Result.success(supplier.get());
    } catch (Throwable error) {
      if (Result.isNonFatal(error)) {
        return Result.failure(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Returns {@code true} if {@code error} is a recoverable exception,
   * otherwise returns {@code false} if {@code error} is a fatal exception.
   */
  public static boolean isNonFatal(Throwable error) {
    return !(error instanceof InterruptedException
          || error instanceof LinkageError
          || error instanceof ThreadDeath
          || (error instanceof VirtualMachineError && !(error instanceof StackOverflowError)));
  }

}
