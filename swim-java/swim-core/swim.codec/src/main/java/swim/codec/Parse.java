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
 * An object representing how to continue parsing from future {@linkplain
 * Input input chunks}. {@code Parse} enables efficient, interruptible
 * parsing of network protocols and data formats, without intermediate
 * buffer copying.
 *
 * <h3>Input tokens</h3>
 * <p>
 * {@code Parse} reads tokens from an {@code Input} reader. Input tokens are
 * modeled as primitive {@code int} values, commonly representing Unicode code
 * points or raw octets. Each {@code Parse} subclass specifies the semantic
 * type of input tokens it consumes.
 *
 * <h3>Parse states</h3>
 * <p>
 * {@code Parse} is always in one of three states: <em>cont</em>inue,
 * <em>done</em>, or <em>error</em>. The <em>cont</em> state indicates that
 * parsing is ready to {@linkplain #consume(Input) consume} more input;
 * the <em>done</em> state indicates that parsing completed successfully,
 * and that the {@link #get()} method will return the parse result;
 * the <em>error</em> state indicates that parsing failed, and that the
 * {@link #getError()} method will return the parse exception.
 * {@code Parse} subclasses default to the <em>cont</em> state.
 *
 * <h3>Consuming input</h3>
 * <p>
 * The {@link #consume(Input)} method incrementally parses as much
 * {@code Input} as it can before returning a new {@code Parse} instance
 * that represents the continuation of how to parse future {@code Input}.
 * The {@code Input} passed to {@code consume} is only guaranteed to be valid
 * for the duration of the method call; references to the provided
 * {@code Input} should not be retained.
 *
 * <h3>Parse results</h3>
 * <p>
 * A successful parse sequence yields a parse result of type {@code T},
 * which can be obtained by calling the {@link #get()} method. {@code get} is
 * only guaranteed to return a result when in the <em>done</em> state; though
 * subclasses may optionally return partial results in other states. A failed
 * parse wraps a parsing error, which can be obtained by calling the
 * {@link #getError()} method. {@code getError} is only guaranteed to return
 * an error when in the <em>error</em> state.
 *
 * <h3>Continuations</h3>
 * <p>
 * {@code Parse} instances represents a continuation of how to parse future
 * {@code Input}. Rather than parsing fully buffered input in one go,
 * {@code Parse} parses chunk at a time, returning a new {@code Parse}
 * instance after each consumed chunk that knows how to parse future chunks.
 * This approach enables non-blocking, incremental parsing that can be
 * interrupted whenever an {@code Input} reader runs out of immediately
 * available tokens. Parsing terminates when a {@code Parse} instance is
 * returned in either the <em>done</em> state or the <em>error</em> state.
 * {@link Parse#done(Object)} returns a {@code Parse} instance in the
 * <em>done</em> state. {@link Parse#error(Throwable)} returns a
 * {@code Parse} instance in the <em>error</em> state.
 *
 * <h3>Iteratees</h3>
 * <p>
 * {@code Parse} is an <a href="https://en.wikipedia.org/wiki/Iteratee">
 * Iteratee</a>. Though unlike purely functional iteratees, {@code Parse}
 * mutably iterates over its {@code Input}, rather than allocating an object
 * for each incremental input continuation. This internal mutability minimizes
 * garbage collector memory pressure, without violating the functional Iteratee
 * contract, provided that {@code consume} takes exclusive ownership of its
 * {@code Input} when invoked, and returns ownership of the {@code Input} in
 * a state that's consistent with the returned {@code Parse} continuation.
 *
 * <h3>Immutability</h3>
 * <p>
 * {@code Parse} instances should be immutable, when possible. Specifically,
 * an invocation of {@code consume} should not alter the behavior of future
 * calls to {@code consume} on the same {@code Parse} instance. {@code Parse}
 * should only mutate its internal state when it's essential to do so, such as
 * for critical performance optimizations.
 *
 * <h3>Backtracking</h3>
 * <p>
 * Parsing can internally {@link Input#clone() clone} its {@code Input},
 * and speculatively consume tokens from the cloned input, backtracking to
 * the original input if the speculative parsing fails. Though keep in mind
 * that, because {@code Input} is only valid for the duration of the call to
 * {@code consume}, input that needs to be preserved between {@code consume}
 * invocations must be internally buffered.
 */
@Public
@Since("5.0")
public abstract class Parse<T> extends Decode<T> {

  protected Parse() {
    // nop
  }

  /**
   * Returns {@code true} when in the <em>cont</em> state and able to
   * {@linkplain #consume(Input) consume} more input.
   */
  @Override
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when in the <em>done</em> state; future calls to
   * {@link #get()} will return the parse result.
   */
  @Override
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when in the <em>error</em> state; future calls to
   * {@link #getError()} will return the parse error.
   */
  @Override
  public boolean isError() {
    return false;
  }

  /**
   * Incrementally parses as much {@code input} as possible before returning
   * a new {@code Parse} instance that represents the continuation of how to
   * parse future {@code Input}. If {@link Input#isLast() input.isLast()} is
   * {@code true}, then {@code consume} <em>must</em> return a terminated
   * {@code Parse} instance in either the <em>done</em> state or the
   * <em>error</em> state. The given {@code input} is only guaranteed to be
   * valid for the duration of the method call; references the {@code input}
   * should not be retained.
   */
  public abstract Parse<T> consume(Input input);

  @Override
  public Parse<T> consume(InputBuffer input) {
    return this.consume((Input) input);
  }

  /**
   * Provides an opportunity for the {@code Parse} instance to propagate
   * backpressure to the caller. Returns {@code true} if the {@code Parse}
   * instance will invoke {@link InputFuture#requestInput() future.requestInput()}
   * when it's ready to consume more input; otherwise returns {@code false}
   * if the {@code Parse} instance is currently ready to consume more input.
   */
  @Override
  public boolean backoff(InputFuture future) {
    return false;
  }

  /**
   * Returns the parse result, if in the <em>done</em> state.
   * Subclasses may optionally return a result in other states.
   *
   * @throws ParseException with the parse error as its cause,
   *         if in the <em>error</em> state.
   * @throws IllegalStateException if in neither the <em>done</em> state
   *         nor the <em>error</em> state.
   */
  @CheckReturnValue
  @Override
  public @Nullable T get() {
    throw new IllegalStateException("Incomplete parse");
  }

  /**
   * Returns the parse result, if in the <em>done</em> state and the result
   * is non-{@code null}.
   *
   * @throws ParseException with the parse error as its cause,
   *         if in the <em>error</em> state.
   * @throws NullPointerException if the parse result is {@code null}.
   * @throws IllegalStateException if in neither the <em>done</em> state
   *         nor the <em>error</em> state.
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() {
    if (this.isDone()) {
      final T value = this.get();
      if (value != null) {
        return value;
      } else {
        throw new NullPointerException("Null parse result");
      }
    } else if (this.isError()) {
      throw new ParseException("Parse failed", this.getError());
    } else {
      throw new IllegalStateException("Incomplete parse");
    }
  }

  /**
   * Returns the parse result, if in the <em>done</em> state;
   * otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  @Override
  public @Nullable T getOr(@Nullable T other) {
    if (this.isDone()) {
      return this.get();
    } else {
      return other;
    }
  }

  /**
   * Returns the parse result, if in the <em>done</em> state and the result
   * is non-{@code null}; otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  @Override
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
   * Returns the parse result, if in the <em>done</em> state; otherwise
   * returns the value produced by the given {@code supplier} function.
   */
  @CheckReturnValue
  @Override
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    if (this.isDone()) {
      return this.get();
    } else {
      return supplier.get();
    }
  }

  /**
   * Returns the parse error, if in the <em>error</em> state;
   * otherwise throws {@link IllegalStateException}.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  @CheckReturnValue
  @Override
  public Throwable getError() {
    throw new IllegalStateException("No parse error");
  }

  /**
   * Casts this {@code Parse} to a different result type if in the
   * <em>error</em> state; otherwise throws {@link IllegalStateException}.
   * Parses in the <em>error</em> state are bi-variant with respect to the
   * result type since they never return a parse result.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  @Override
  public <T2> Parse<T2> asError() {
    throw new IllegalStateException("No parse error");
  }

  /**
   * Throws a {@link ParseException} with the parse error as its cause,
   * if in the <em>error</em> state; otherwise returns {@code this}.
   *
   * @throws ParseException with the parse error as its cause,
   *         if in the <em>error</em> state.
   */
  @Override
  public Parse<T> checkError() {
    if (this.isError()) {
      throw new ParseException("Parse failed", this.getError());
    } else {
      return this;
    }
  }

  /**
   * Throws a {@link ParseException} if not in the <em>done</em> state;
   * otherwise returns {@code this}. If in the <em>error</em> state,
   * the parse error will be included as the cause of the thrown
   * {@code ParseException}.
   *
   * @throws ParseException if not in the <em>done</em> state.
   */
  @Override
  public Parse<T> checkDone() {
    if (this.isDone()) {
      return this;
    } else if (this.isError()) {
      throw new ParseException("Parse failed", this.getError());
    } else {
      throw new ParseException("Incomplete parse");
    }
  }

  @Override
  public Result<T> toResult() {
    try {
      return Result.success(this.get());
    } catch (Throwable error) {
      if (Result.isNonFatal(error)) {
        return Result.failure(error);
      } else {
        throw error;
      }
    }
  }

  private static final Parse<Object> DONE = new ParseDone<Object>(null);

  /**
   * Returns a {@code Parse} instance in the <em>done</em> state that wraps
   * a {@code null} parse result.
   */
  @CheckReturnValue
  public static <T> Parse<T> done() {
    return Assume.conforms(DONE);
  }

  /**
   * Returns a {@code Parse} instance in the <em>done</em> state that wraps
   * the given parse {@code result}.
   */
  @CheckReturnValue
  public static <T> Parse<T> done(@Nullable T result) {
    if (result == null) {
      return Parse.done();
    } else {
      return new ParseDone<T>(result);
    }
  }

  /**
   * Returns a {@code Parse} instance in the <em>error</em> state that wraps
   * the given parse {@code error}.
   */
  @CheckReturnValue
  public static <T> Parse<T> error(Throwable error) {
    return new ParseError<T>(error);
  }

  /**
   * Returns a {@code Parse} instance in the <em>error</em> state that wraps
   * a {@link ParseException} with the given {@code diagnostic}.
   */
  @CheckReturnValue
  public static <T> Parse<T> error(Diagnostic diagnostic) {
    return Parse.error(new ParseException(diagnostic));
  }

  /**
   * Returns a {@code Parse} instance in the <em>error</em> state that wraps
   * a {@link ParseException} with the given {@code diagnostic} and {@code cause}.
   */
  @CheckReturnValue
  public static <T> Parse<T> error(Diagnostic diagnostic, @Nullable Throwable cause) {
    return Parse.error(new ParseException(diagnostic, cause));
  }

}

final class ParseDone<T> extends Parse<T> implements ToSource {

  final @Nullable T value;

  ParseDone(@Nullable T value) {
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
  public Parse<T> consume(Input input) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    return this.value;
  }

  @Override
  public Result<T> toResult() {
    return Result.success(this.value);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Parse", "done");
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

final class ParseError<T> extends Parse<T> implements ToSource {

  final Throwable error;

  ParseError(Throwable error) {
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
  public Parse<T> consume(Input input) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    throw new ParseException("Parse failed", this.error);
  }

  @Override
  public Throwable getError() {
    return this.error;
  }

  @Override
  public <T2> Parse<T2> asError() {
    return Assume.conforms(this);
  }

  @Override
  public Result<T> toResult() {
    return Result.failure(this.error);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Parse", "error")
            .appendArgument(this.error)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
