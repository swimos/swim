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
 * The state of an interruptible parse operation. A {@code Parse} instance
 * {@linkplain #consume(Input) consumes} an {@linkplain Input input} chunk,
 * returning a new {@code Parse} instance representing the continuation of
 * the parse operation. Parsing continues chunk by chunk until a {@code Parse}
 * instance in a terminal state is reached. This approach enables efficient,
 * interruptible parsing of composite network protocols and data formats
 * without blocking or intermediate buffering.
 *
 * {@code Parse} instances sequentially consume input chunks token by token.
 * This enables {@code Parse} instances to consume incrementally decoded input,
 * such as {@linkplain Utf8DecodedInput UTF-8 decoded input}, without having
 * to first decode the input to a separate buffer. For this reason, the
 * {@code Parse} interface is commonly used to implement text format parsers,
 * whereas the parent {@link Decode} interface is often used to implement
 * binary format decoders.
 *
 * <h2>Input tokens</h2>
 * <p>
 * {@code Parse} instances sequentially consume tokens from an {@link Input}
 * chunk. Input tokens are modeled as primitive {@code int} values, commonly
 * representing Unicode code points, or raw octets. The expected semantics of
 * input tokens is specified by individual {@code Parse} subclasses.
 *
 * <h2>Parse states</h2>
 * <p>
 * A {@code Parse} instance is always in one—and only one—of the following
 * three <em>parse states</em>:
 * <ul>
 * <li>{@link #isCont() parse-cont}: the parse operation is ready
 *     to {@linkplain #consume(Input) consume} more input
 * <li>{@link #isDone() parse-done}: the parse operation terminated
 *     with a {@linkplain #get() parsed value}
 * <li>{@link #isError() parse-error}: the parse operation terminated
 *     with a {@linkplain #getError() parse error}
 * </ul>
 * <p>
 * {@code Parse} subclasses default to the {@code parse-cont} state.
 * {@link Parse#done(Object) Parse.done(T)} returns an instance in the
 * {@code parse-done} state. {@link Parse#error(Throwable)} returns an
 * instance in the {@code parse-error} state.
 *
 * <h2>Consuming input</h2>
 * <p>
 * The {@link #consume(Input)} method parses a single input chunk and returns
 * a new {@code Parse} instance representing the updated state of the parse
 * operation. Any returned {@code Parse} instance in the {@code parse-cont}
 * state should eventually be called to {@code consume} an additional input
 * chunk. If the end of input is reached, {@code consume} should be called
 * with input in the {@link Input#isDone() input-done} state. The parse
 * operation terminates when {@code consume} returns a {@code Parse} instance
 * in either the {@code parse-done} state or the {@code parse-error} state.
 *
 * <h2>Parse results</h2>
 * <p>
 * A successful parse operation wraps a <em>parsed value</em> of type
 * {@code T}, which can be obtained by calling a member of the {@code get}
 * family of methods:
 * <ul>
 * <li>{@link #get()}: returns the parsed value, if available;
 *     otherwise throws an exception
 * <li>{@link #getNonNull()}: returns the parsed value, if available
 *     and not {@code null}; otherwise throws an exception
 * <li>{@link #getUnchecked()}: returns the parsed value, if available;
 *     otherwise throws an unchecked exception
 * <li>{@link #getNonNullUnchecked()}: returns the parsed value, if available
 *     and not {@code null}; otherwise throws an unchecked exception
 * <li>{@link #getOr(Object) getOr(T)}: returns the parsed value, if available;
 *     otherwise returns some other value
 * <li>{@link #getNonNullOr(Object) getNonNullOr(T)}: returns the parsed value,
 *     if available and not {@code null}; otherwise returns some other value
 * <li>{@link #getOrElse(Supplier)}: returns the parsed value, if available;
 *     otherwise returns a value supplied by a function
 * <li>{@link #getNonNullOrElse(Supplier)}: returns the parsed value,
 *     if available and not {@code null}, otherwise returns a value
 *     supplied by a function
 * </ul>
 * <p>
 * A failed parse operation wraps a throwable <em>parse error</em>,
 * which can be obtained by calling the {@link #getError()} method.
 *
 * <h2>Parse continuations</h2>
 * <p>
 * Think of a {@code Parse} instance in the {@code parse-cont} state as
 * capturing the call stack of a parse operation at the point where it ran
 * out of available input. When {@code consume} is subsequently called with
 * new input, the call stack is reconstructed, and parsing continues where
 * it left off. The stack is captured by returning a {@code Parse} instance
 * containing the state of each parse frame as the stack unwinds. The stack is
 * restored by invoking {@code consume} on any nested {@code Parse} instances
 * that were captured when the parse operation was previously interrupted.
 *
 * <h2>Backpressure propagation</h2>
 * <p>
 * {@code Parse} subclasses can optionally propagate backpressure by
 * overriding the {@link #backoff(InputFuture)} method. Backpressure-aware
 * parsers invoke {@code backoff} with an {@code InputFuture} after every
 * call to {@code consume}. If {@code backoff} returns {@code true}, the
 * parser will not invoke {@code consume} again until the {@code Parse}
 * instance calls {@link InputFuture#requestInput()}. Returning {@code false}
 * from {@code backoff} indicates that the {@code Parse} instance is currently
 * ready to consume more input.
 *
 * <h2>Immutability</h2>
 * <p>
 * {@code Parse} instances should be immutable whenever possible.
 * Specifically, an invocation of {@code consume} should not alter the behavior
 * of subsequent calls to {@code consume} on the same {@code Parse} instance.
 * A {@code Parse} instance should only mutate its internal state when it's
 * essential to do so, such as for critical performance optimizations.
 *
 * <h2>Backtracking</h2>
 * <p>
 * A {@code Parse} implementation can internally {@link Input#clone() clone}
 * its input and then speculatively consume tokens from the cloned input.
 * If speculative parsing of the cloned input fails, an alternate parsing
 * path can be resumed from the original input. Keep in mind that, because
 * input is only valid for the duration of the call to {@code consume},
 * {@code Parse} implementations cannot backtrack to a preceding input chunk.
 *
 * <h2>Relationship to iteratees</h2>
 * <p>
 * The {@code Parse} interface is similar to the
 * <a href="https://en.wikipedia.org/wiki/Iteratee">Iteratee</a> pattern.
 * Though unlike purely functional iteratees, {@code Parse} instances mutably
 * iterate over their input. This internal mutability improves efficiency
 * without inhibiting composition, provided that {@code consume} takes
 * ownership of its input when invoked, and leaves the input in a state
 * that's consistent with the returned {@code Parse} continuation.
 *
 * @param <T> the type of parsed value
 *
 * @see Input
 * @see Parser
 */
@Public
@Since("5.0")
public abstract class Parse<@Covariant T> extends Decode<T> {

  /**
   * Constructs a {@code Parse} instance in the {@code parse-cont} state.
   */
  protected Parse() {
    // nop
  }

  /**
   * Returns {@code true} when in the {@code parse-cont} state,
   * ready to {@linkplain #consume(Input) consume} more input.
   *
   * @return whether or not this {@code Parse} instance is
   *         in the {@code parse-cont} state
   */
  @Override
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when in the {@code parse-done} state,
   * having terminated with a {@linkplain #get() parsed value}.
   *
   * @return whether or not this {@code Parse} instance is
   *         in the {@code parse-done} state
   */
  @Override
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when in the {@code parse-error} state,
   * having terminated with a {@linkplain #getError() parse error}.
   *
   * @return whether or not this {@code Parse} instance is
   *         in the {@code parse-error} state
   */
  @Override
  public boolean isError() {
    return false;
  }

  /**
   * Parses an {@code input} chunk and returns a new {@code Parse} instance
   * representing the updated state of the parse operation. If the input
   * enters the {@link Input#isDone() input-done} state, then {@code consume}
   * <em>must</em> return a terminated {@code Parse} instance in either the
   * {@code parse-done} state or the {@code parse-error} state. The given
   * {@code input} is only guaranteed to be valid for the duration of the
   * method call; references to {@code input} should not be retained.
   *
   * @param input the input to consume
   * @return the continuation of the parse operation
   */
  public abstract Parse<T> consume(Input input);

  @Override
  public Parse<T> consume(InputBuffer input) {
    return this.consume((Input) input);
  }

  /**
   * Ensures that a value has been successfully parsed,
   * and the end of {@code input} has been reached.
   * The following conditions are sequentially evaluated:
   * <ul>
   * <li>When in the {@code parse-error} state, returns {@code this}
   *     so as to not clobber prior parse errors.
   * <li>If the {@code input} is in the {@link Input#isError()
   *     input-error} state, returns the input exception wrapped
   *     in a new {@code Parse} error.
   * <li>If the {@code input} is in the {@link Input#isCont()
   *     input-cont} state, returns a new {@code Parse} error
   *     indicating that the input was not fully consumed.
   * <li>When in the {@code parse-cont} state, returns a new
   *     {@code Parse} error indicating an unexpected end of input.
   * <li>Otherwise returns {@code this}, having reached the end of input
   *     in the {@code parse-done} state.
   * </ul>
   *
   * @param input the input whose end should have been reached
   * @return {@code this} if in the {@code parse-done} state, having
   *         reached the end of {@code input}; otherwise returns a
   *         {@code Parse} instance in the {@code parse-error} state
   */
  public Parse<T> complete(Input input) {
    if (input.isError()) {
      return Parse.error(input.getError());
    } else if (input.isCont()) {
      return Parse.error(Diagnostic.message("unconsumed input", input));
    } else {
      return Parse.error(Diagnostic.unexpected(input));
    }
  }

  @Override
  public Parse<T> complete(InputBuffer input) {
    return this.complete((Input) input);
  }

  /**
   * Provides an opportunity for the {@code Parse} instance to propagate
   * backpressure to the caller. Returns {@code true} if the {@code Parse}
   * instance will invoke {@link InputFuture#requestInput() future.requestInput()}
   * when it's ready to consume more input; otherwise returns {@code false}
   * if the {@code Parse} instance is currently ready to consume more input.
   * The default implementation returns {@code false}.
   * <p>
   * After {@code backoff} returns {@code true}, but before {@code
   * future.requestInput()} is called, the {@code Parse} instance enters the
   * implicit {@code parse-backoff} state. Once in the {@code parse-backoff}
   * state, it is responsibility of the {@code Parse} instance to ensure that
   * {@code future.requestInput()} eventually gets called.
   * <p>
   * Parse backoff is advisory. A parser may invoke {@code consume}
   * at any time. Even backpressure-aware parsers may disregard the
   * {@code parse-backoff} state and invoke {@code consume} with a
   * terminated input in order to terminate a parse operation.
   * <p>
   * Consider the example of a proxy stream that parses one input,
   * and writes another output. There's no point invoking {@code consume}
   * on the parse end of the stream if the write end's output is full.
   * Such a stream can wait for output capacity to become available
   * before calling {@code future.requestInput()}.
   *
   * @param future an input future that will trigger an invocation of
   *        {@code consume} after its {@code requestInput} method is called
   * @return whether or not the parser should wait to invoke {@code consume}
   *         until after {@code future.requestInput()} is called
   */
  @Override
  public boolean backoff(InputFuture future) {
    return false;
  }

  /**
   * Returns the parsed value, if in the {@code parse-done} state;
   * otherwise throws an exception. Subclasses may optionally return
   * a value in other states.
   *
   * @return the parsed value, if available
   * @throws ParseException if in the {@code parse-error} state
   * @throws IllegalStateException if in the {@code parse-cont} state
   */
  @CheckReturnValue
  @Override
  public @Nullable T get() throws ParseException {
    throw new IllegalStateException("incomplete parse");
  }

  /**
   * Returns the parsed value, if in the {@code parse-done} state and
   * the parsed value is not {@code null}; otherwise throws an exception.
   * Subclasses may optionally return a non-{@code null} value in other states.
   * The default implementation delegates to {@link #get()},
   * {@code null}-checking its return value.
   *
   * @return the parsed value, if available and not {@code null}
   * @throws ParseException if in the {@code parse-error} state
   * @throws IllegalStateException if in the {@code parse-cont} state
   * @throws NullPointerException if the parsed value is {@code null}
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() throws ParseException {
    final T value = this.get();
    if (value == null) {
      throw new NullPointerException("parsed value is null");
    }
    return value;
  }

  /**
   * Returns the parsed value, if in the {@code parse-done} state;
   * otherwise throws an unchecked exception. Subclasses may optionally
   * return a value in other states. The default implementation delegates
   * to {@link #get()}, catching any {@code ParseException} and rethrowing
   * it as the cause of a {@code NoSuchElementException}.
   *
   * @return the parsed value, if available
   * @throws NoSuchElementException if in the {@code parse-error} state
   * @throws IllegalStateException if in the {@code parse-cont} state
   */
  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    try {
      return this.get();
    } catch (ParseException cause) {
      throw new NoSuchElementException("parse error", cause);
    }
  }

  /**
   * Returns the parsed value, if in the {@code parse-done} state and
   * the parsed value is not {@code null}; otherwise throws an unchecked
   * exception. Subclasses may optionally return a non-{@code null} value
   * in other states. The default implementation delegates to
   * {@link #getNonNull()}, catching any {@code ParseException}
   * and rethrowing it as the cause of a {@code NoSuchElementException}.
   *
   * @return the parsed value, if available and not {@code null}
   * @throws NoSuchElementException if in the {@code parse-error} state
   * @throws IllegalStateException if in the {@code parse-cont} state
   * @throws NullPointerException if the parsed value is {@code null}
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    try {
      return this.getNonNull();
    } catch (ParseException cause) {
      throw new NoSuchElementException("parse error", cause);
    }
  }

  /**
   * Returns the parsed value, if in the {@code parse-done} state;
   * otherwise returns some {@code other} value. The default implementation
   * delegates to {@link #get()}, catching any {@code ParseException}
   * or {@code IllegalStateException} to instead return {@code other}.
   *
   * @param other returned when a parsed value is not available
   * @return either the parsed value, or the {@code other} value
   */
  @CheckReturnValue
  @Override
  public @Nullable T getOr(@Nullable T other) {
    try {
      return this.get();
    } catch (ParseException | IllegalStateException cause) {
      return other;
    }
  }

  /**
   * Returns the parsed value, if in the {@code parse-done} state
   * and the parsed value is not {@code null}; otherwise returns some
   * non-{@code null} {@code other}. The default implementation delegates
   * to {@link #getNonNull()}, catching any {@code ParseException},
   * {@code IllegalStateException}, or {@code NullPointerException}
   * to instead {@code null}-check and return the {@code other} value.
   *
   * @param other non-{@code null} value returned when
   *        the parsed value is {@code null} or not available
   * @return either the non-{@code null} parsed value,
   *         or the non-{@code null} {@code other} value
   * @throws NullPointerException if the parsed value and
   *         the {@code other} value are both {@code null}
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOr(@NonNull T other) {
    try {
      return this.getNonNull();
    } catch (ParseException | IllegalStateException | NullPointerException cause) {
      if (other == null) {
        throw new NullPointerException("other value is null");
      }
      return other;
    }
  }

  /**
   * Returns the parsed value, if in the {@code parse-done} state;
   * otherwise returns the value returned by the given {@code supplier}
   * function. The default implementation delegates to {@link #get()},
   * catching any {@code ParseException} or {@code IllegalStateException}
   * to instead return the value returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a return value when
   *        a parsed value is not available
   * @return either the parsed value, or the value returned
   *         by the {@code supplier} function
   */
  @CheckReturnValue
  @Override
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    try {
      return this.get();
    } catch (ParseException | IllegalStateException cause) {
      return supplier.get();
    }
  }

  /**
   * Returns the parsed value, if in the {@code parse-done} state and
   * the parsed value is not {@code null}; otherwise returns the
   * non-{@code null} value returned by the given {@code supplier} function.
   * The default implementation delegates to {@link #getNonNull()},
   * catching any {@code ParseException}, {@code IllegalStateException},
   * or {@code NullPointerException} to instead {@code null}-check and
   * return the value returned by the {@code supplier} function.
   *
   * @param supplier invoked to obtain a non-{@code null} return value
   *        when the parsed value is {@code null} or not available
   * @return either the non-{@code null} parsed value, or the
   *         non-{@code null} value returned by the {@code supplier} function
   * @throws NullPointerException if the parsed value and the value returned
   *         by the {@code supplier} function are both {@code null}
   */
  @CheckReturnValue
  @Override
  public @NonNull T getNonNullOrElse(Supplier<? extends T> supplier) {
    try {
      return this.getNonNull();
    } catch (ParseException | IllegalStateException | NullPointerException cause) {
      final T value = supplier.get();
      if (value == null) {
        throw new NullPointerException("supplied value is null");
      }
      return value;
    }
  }

  /**
   * Returns the parse error, if in the {@code parse-error} state;
   * otherwise throws an unchecked exception.
   *
   * @return the parse error, if present
   * @throws IllegalStateException if not in the {@code parse-error} state
   */
  @CheckReturnValue
  @Override
  public Throwable getError() {
    throw new IllegalStateException("no parse error");
  }

  /**
   * Casts this {@code Parse} instance to a different parsed value type,
   * if in the {@code parse-error} state; otherwise throws an unchecked
   * exception. {@code Parse} instances in the {@code parse-error} state
   * are bi-variant with respect to their parsed value type since they
   * never actually return a parsed value.
   * <p>
   * If not already in the {@code parse-error} state, returns a new
   * {@code Parse} instance in the {@code parse-error} state that
   * wraps an {@code IllegalStateException}.
   *
   * @return {@code this}, if in the {@code parse-error} state
   */
  @Override
  public <T2> Parse<T2> asError() {
    return Parse.error(new IllegalStateException("incomplete parse"));
  }

  /**
   * Throws a checked exception if in the {@code parse-error} state,
   * otherwise returns {@code this}. If in the {@code parse-error} state
   * and the parse error is an instance of {@code ParseException},
   * the parse error is rethrown; otherwise a new {@code ParseException}
   * is thrown with the parse error as its cause.
   *
   * @return {@code this}, if not in the {@code parse-error} state
   * @throws ParseException if in the {@code parse-error} state
   */
  @Override
  public Parse<T> checkError() throws ParseException {
    return this;
  }

  /**
   * Throws a checked exception if not in the {@code parse-done} state,
   * otherwise returns {@code this}. If in the {@code parse-error} state
   * and the parse error is an instance of {@code ParseException},
   * the parse error is rethrown; otherwise a new {@code ParseException}
   * is thrown with the parse error as its cause. If in the
   * {@code parse-cont} state, a new {@code ParseException}
   * is thrown to indicate an incomplete parse.
   *
   * @return {@code this}, if in the {@code parse-done} state
   * @throws ParseException if not in the {@code parse-done} state
   */
  @Override
  public Parse<T> checkDone() throws ParseException {
    throw new ParseException("incomplete parse");
  }

  /**
   * Throws an {@link AssertionError} if not in the {@code parse-done} state,
   * otherwise returns {@code this}. The {@code AssertionError} will set the
   * parse error as its cause, if in the {@code parse-error} state.
   *
   * @return {@code this}, if in the {@code parse-done} state
   * @throws AssertionError if not in the {@code parse-done} state
   */
  @Override
  public Parse<T> assertDone() {
    throw new AssertionError("incomplete parse");
  }

  @CheckReturnValue
  @Override
  public <U> Parse<U> map(Function<? super T, ? extends U> mapper) {
    return new ParseMapper<T, U>(this, mapper);
  }

  /**
   * Converts this {@code Parse} instance to a {@link Result}. {@code Parse}
   * states map to {@code Result} states according to the following rules:
   * <ul>
   * <li>Returns an {@link Result#ok(Object) ok result} containing
   *     the decoded value when in the {@code parse-done} state
   * <li>Returns an {@link Result#error(Throwable) error result} wrapping
   *     the parse error when in the {@code parse-error} state
   * <li>Returns an {@code error result} wrapping an
   *     {@code IllegalStateException} when in the {@code parse-cont} state
   * </ul>
   *
   * @return the result of this parse operation
   */
  @CheckReturnValue
  @Override
  public Result<T> toResult() {
    try {
      return Result.ok(this.get());
    } catch (ParseException | IllegalStateException cause) {
      return Result.error(cause);
    }
  }

  /**
   * Singleton {@code Parse} instance in the {@code parse-done} state
   * containing a {@code null} parsed value.
   */
  private static final Parse<Object> DONE = new ParseDone<Object>(null);

  /**
   * Returns a {@code Parse} instance in the {@code parse-done} state
   * containing a {@code null} parsed value. Always returns the same
   * singleton {@code Parse} instance.
   *
   * @return a singleton {@code Parse} instance in the {@code parse-done}
   *         state containing a {@code null} parsed value
   */
  @CheckReturnValue
  public static <T> Parse<T> done() {
    return Assume.conforms(DONE);
  }

  /**
   * Returns a {@code Parse} instance in the {@code parse-done} state
   * containing the given parsed {@code value}. If {@code value} is
   * {@code null}, returns the singleton {@link Parse#done()} instance.
   *
   * @param value the parsed value to be contained by
   *        the returned {@code Parse} instance
   * @return a {@code Parse} instance in the {@code parse-done} state
   *         containing the parsed {@code value}
   */
  @CheckReturnValue
  public static <T> Parse<T> done(@Nullable T value) {
    if (value != null) {
      return new ParseDone<T>(value);
    } else {
      return Assume.conforms(DONE);
    }
  }

  /**
   * Returns a {@code Parse} instance in the {@code parse-error} state
   * that wraps the given parse {@code error}.
   *
   * @param error the parse error to be wrapped by
   *        the returned {@code Parse} instance
   * @return a {@code Parse} instance in the {@code parse-error} state
   *         that wraps the parse {@code error}
   */
  @CheckReturnValue
  public static <T> Parse<T> error(Throwable error) {
    Objects.requireNonNull(error);
    return new ParseError<T>(error);
  }

  /**
   * Returns a {@code Parse} instance in the {@code parse-error} state
   * whose parse error is a new {@link ParseException} containing
   * the given {@code diagnostic}.
   *
   * @param diagnostic the diagnostic to be contained by a new
   *        {@code ParseException} that will serve as the parse error
   *        of the returned {@code Parse} instance
   * @return a {@code Parse} instance in the {@code parse-error} state
   *         whose parse error is a new {@code ParseException} containing
   *         the {@code diagnostic}
   */
  @CheckReturnValue
  public static <T> Parse<T> error(Diagnostic diagnostic) {
    Objects.requireNonNull(diagnostic, "diagnostic");
    return Parse.error(new ParseException(diagnostic));
  }

  /**
   * Returns a {@code Parse} instance in the {@code parse-error} state
   * whose parse error is a new {@link ParseException} containing
   * the given {@code diagnostic} and throwable {@code cause}.
   *
   * @param diagnostic the diagnostic to be contained by a new
   *        {@code ParseException} that will serve as the parse error
   *        of the returned {@code Parse} instance
   * @param cause the cause of the {@code ParseException} that will serve
   *        as the parse error of the returned {@code Parse} instance
   * @return a {@code Parse} instance in the {@code parse-error} state
   *         whose parse error is a new {@code ParseException} containing
   *         the {@code diagnostic} and throwable {@code cause}
   */
  @CheckReturnValue
  public static <T> Parse<T> error(Diagnostic diagnostic, @Nullable Throwable cause) {
    Objects.requireNonNull(diagnostic, "diagnostic");
    Objects.requireNonNull(cause, "cause");
    return Parse.error(new ParseException(diagnostic, cause));
  }

  /**
   * Returns a {@code Parse} instance in the {@code parse-error} state
   * whose parse error is a new {@link ParseException} containing a new
   * {@link Diagnostic} attached to the given {@code input} with a message
   * derived from the given throwable {@code cause}.
   *
   * @param input the {@code Input} whose current position is the location
   *        of the parse error
   * @param cause the cause of the {@code ParseException} that will serve
   *        as the parse error of the returned {@code Parse} instance,
   *        and whose message will server as the diagnostic message
   * @return a {@code Parse} instance in the {@code parse-error} state
   *         whose parse error is a new {@code ParseException} containing
   *         a {@code diagnostic} derived from the given {@code input}
   *         and throwable {@code cause}
   */
  @CheckReturnValue
  public static <T> Parse<T> diagnostic(Input input, Throwable cause) {
    Objects.requireNonNull(input, "input");
    Objects.requireNonNull(cause, "cause");
    final Diagnostic diagnostic = Diagnostic.message(cause.getMessage(), input);
    return Parse.error(new ParseException(diagnostic, cause));
  }

}

final class ParseDone<@Covariant T> extends Parse<T> implements WriteSource {

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

  @Override
  public Parse<T> complete(Input input) {
    if (input.isError()) {
      return Parse.error(input.getError());
    } else if (input.isCont()) {
      return Parse.error(Diagnostic.message("unconsumed input", input));
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
      throw new NullPointerException("parsed value is null");
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
      throw new NullPointerException("parsed value is null");
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
  public Parse<T> checkDone() {
    return this;
  }

  @Override
  public Parse<T> assertDone() {
    return this;
  }

  @CheckReturnValue
  @Override
  public <U> Parse<U> map(Function<? super T, ? extends U> mapper) {
    try {
      return Parse.done(mapper.apply(this.value));
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      return Parse.error(cause);
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
    } else if (other instanceof ParseDone<?> that) {
      return Objects.equals(this.value, that.value);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(ParseDone.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.value)));
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
    return WriteSource.toString(this);
  }

}

final class ParseError<@Covariant T> extends Parse<T> implements WriteSource {

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

  @Override
  public Parse<T> complete(Input input) {
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() throws ParseException {
    if (this.error instanceof ParseException) {
      throw (ParseException) this.error;
    } else {
      throw new ParseException("parse failed", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() throws ParseException {
    if (this.error instanceof ParseException) {
      throw (ParseException) this.error;
    } else {
      throw new ParseException("parse failed", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    throw new NoSuchElementException("parse failed", this.error);
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    throw new NoSuchElementException("parse failed", this.error);
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
  public <T2> Parse<T2> asError() {
    return Assume.conforms(this);
  }

  @Override
  public Parse<T> checkError() throws ParseException {
    if (this.error instanceof ParseException) {
      throw (ParseException) this.error;
    } else {
      throw new ParseException("parse failed", this.error);
    }
  }

  @Override
  public Parse<T> checkDone() throws ParseException {
    if (this.error instanceof ParseException) {
      throw (ParseException) this.error;
    } else {
      throw new ParseException("parse failed", this.error);
    }
  }

  @Override
  public Parse<T> assertDone() {
    throw new AssertionError("parse failed", this.error);
  }

  @CheckReturnValue
  @Override
  public <U> Parse<U> map(Function<? super T, ? extends U> mapper) {
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
    } else if (other instanceof ParseError<?> that) {
      return this.error.equals(that.error);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(ParseError.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.error.hashCode()));
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
    return WriteSource.toString(this);
  }

}

final class ParseMapper<S, T> extends Parse<T> implements WriteSource {

  final Parse<S> parse;
  final Function<? super S, ? extends T> mapper;

  ParseMapper(Parse<S> parse, Function<? super S, ? extends T> mapper) {
    this.parse = parse;
    this.mapper = mapper;
  }

  @Override
  public Parse<T> consume(Input input) {
    return this.parse.consume(input).map(this.mapper);
  }

  @CheckReturnValue
  @Override
  public <U> Parse<U> map(Function<? super T, ? extends U> mapper) {
    return new ParseMapper<S, U>(this.parse, this.mapper.andThen(mapper));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.parse)
            .beginInvoke("map")
            .appendArgument(this.mapper)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
