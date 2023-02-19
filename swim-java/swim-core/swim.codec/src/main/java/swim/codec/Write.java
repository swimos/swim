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
 * An object representing how to continue writing to future {@linkplain
 * Output output chunks}. {@code Write} enables efficient, interruptible
 * writing of network protocols and data formats, without intermediate
 * buffering copying.
 *
 * <h3>Output tokens</h3>
 * <p>
 * {@code Write} writes tokens to an {@code Output} writer. Output tokens are
 * modeled as primitive {@code int} values, commonly representing Unicode code
 * points or raw octets. Each {@code Write} subclass specifies the semantic
 * type of output tokens it produces.
 *
 * <h3>Write states</h3>
 * <p>
 * {@code Write} is always in one of three states: <em>cont</em>inue,
 * <em>done</em>, or <em>error</em>. The <em>cont</em> state indicates that
 * writing is ready to {@linkplain #produce(Output) produce} more output;
 * the <em>done</em> state indicates that writing completed successfully,
 * and that the {@link #get()} method will return the write result;
 * the <em>error</em> state indicates that writing failed, and that the
 * {@link getError()} method will return the write exception.
 * {@code Write} subclasses default to the <em>cont</em> state.
 *
 * <h3>Producing output</h3>
 * <p>
 * The {@link #produce(Output)} method incrementally writes as much
 * {@code Output} as it can before returning a new {@code Write} instance
 * that represents the continuation of how to write future {@code Output}.
 * The {@code Output} passed to {@code produce} is only guaranteed to be
 * valid for the duration of the method call; references to the provided
 * {@code Output} should not be retained.
 *
 * <h3>Write results</h3>
 * <p>
 * A successful write sequence yields a write result of type {@code T},
 * which can be obtained by calling the {@link #get()} method. {@code get} is
 * only guaranteed to return a result when in the <em>done</em> state; though
 * subclasses may optionally return partial results in other states. A failed
 * write wraps a write error, which can be obtained by calling the
 * {@link #getError()} method. {@code getError} is only guaranteed to return
 * an error when in the <em>error</em> state.
 *
 * <h3>Continuations</h3>
 * <p>
 * {@code Write} instances represent a continuation of how to write future
 * {@code Output}. Rather than writing complete output to a growable buffer
 * in one go, {@code Write} writes one chunk at a time, returning a new
 * {@code Write} instance after each produced chunk that knows how to write
 * future chunks. This approach enables non-blocking, incremental writing that
 * can be interrupted whenever an {@code Output} writer runs out of immediately
 * available space. Writing terminates when a {@code Write} instance is
 * returned in either the <em>done</em> state or the <em>error</em> state.
 * {@link Write#done(Object)} returns a {@code Write} instance in the
 * <em>done</em> state. {@link Write#error(Throwable)} returns a
 * {@code Write} instance in the <em>error</em> state.
 */
@Public
@Since("5.0")
public abstract class Write<T> extends Encode<T> {

  protected Write() {
    // nop
  }

  /**
   * Returns {@code true} when in the <em>cont</em> state and able to
   * {@linkplain #produce(Output) produce} more output.
   */
  @Override
  public boolean isCont() {
    return true;
  }

  /**
   * Returns {@code true} when in the <em>done</em> state; future calls to
   * {@link #get()} will return the write result.
   */
  @Override
  public boolean isDone() {
    return false;
  }

  /**
   * Returns {@code true} when in the <em>error</em> state; future calls to
   * {@link #getError()} will return the write error.
   */
  @Override
  public boolean isError() {
    return false;
  }

  /**
   * Incrementally writes as much {@code output} as possible before returning
   * a new {@code Write} instance that represents the continuation of how to
   * write future {@code Output}. If {@link Output#isLast() isLast} is
   * {@code true}, then {@code produce} <em>must</em> return a terminated
   * {@code Write} instance in either the <em>done</em> state or the
   * <em>error</em> state. The given {@code output} is only guaranteed to be
   * valid for the duration of the method call; references to {@code output}
   * should not be retained.
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
   */
  @Override
  public boolean backoff(OutputFuture future) {
    return false;
  }

  /**
   * Returns the write result, if in the <em>done</em> state.
   * Subclasses may optionally return a result in other states.
   *
   * @throws WriteException with the write error as its cause,
   *         if in the <em>error</em> state.
   * @throws IllegalStateException if in neither the <em>done</em> state
   *         nor the <em>error</em> state.
   */
  @CheckReturnValue
  @Override
  public @Nullable T get() {
    throw new IllegalStateException("Incomplete write");
  }

  /**
   * Returns the write result, if in the <em>done</em> state and the result
   * is non-{@code null}.
   *
   * @throws WriteException with the write error as its cause,
   *         if in the <em>error</em> state.
   * @throws NullPointerException if the write result is {@code null}.
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
        throw new NullPointerException("Null write result");
      }
    } else if (this.isError()) {
      throw new WriteException("Write failed", this.getError());
    } else {
      throw new IllegalStateException("Incomplete write");
    }
  }

  /**
   * Returns the write result, if in the <em>done</em> state;
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
   * Returns the write result, if in the <em>done</em> state and the result
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
   * Returns the write result, if in the <em>done</em> state; otherwise
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
   * Returns the write error if in the <em>error</em> state;
   * otherwise throws {@link IllegalStateException}.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  @CheckReturnValue
  @Override
  public Throwable getError() {
    throw new IllegalStateException("No write error");
  }

  /**
   * Casts this {@code Write} to a different result type if in the
   * <em>error</em> state; otherwise throws {@link IllegalStateException}.
   * Writes in the <em>error</em> state are bi-variant with respect to the
   * result type since they never return a write result.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  @Override
  public <T2> Write<T2> asError() {
    throw new IllegalStateException("No write error");
  }

  /**
   * Throws a {@link WriteException} with the write error as its cause,
   * if in the <em>error</em> state; otherwise does nothing.
   *
   * @throws WriteException with the write error as its cause,
   *         if in the <em>error</em> state.
   */
  @Override
  public void checkError() {
    if (this.isError()) {
      throw new WriteException("Write failed", this.getError());
    }
  }

  /**
   * Throws a {@link WriteException} if not in the <em>done</em> state;
   * otherwise does nothing. If in the <em>error</em> state, the write error
   * will be included as the cause of the thrown {@code WriteException}.
   *
   * @throws WriteException if not in the <em>done</em> state.
   */
  @Override
  public void checkDone() {
    if (this.isError()) {
      throw new WriteException("Write failed", this.getError());
    } else if (!this.isDone()) {
      throw new WriteException("Incomplete write");
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

  /**
   * Returns a {@code Write} instance that continues writing {@code that}
   * after it finishes writing {@code this}.
   */
  public <T2> Write<T2> andThen(Write<T2> that) {
    return new WriteAndThen<T2>(this, that);
  }

  @Override
  public <T2> Write<T2> andThen(Encode<T2> that) {
    return this.andThen((Write<T2>) that);
  }

  private static final Write<Object> DONE = new WriteDone<Object>(null);

  /**
   * Returns a {@code Write} instance in the <em>done</em> state that wraps
   * a {@code null} write result.
   */
  @CheckReturnValue
  public static <T> Write<T> done() {
    return Assume.conforms(DONE);
  }

  /**
   * Returns a {@code Write} instance in the <em>done</em> state that wraps
   * the given write {@code result}.
   */
  @CheckReturnValue
  public static <T> Write<T> done(@Nullable T result) {
    if (result == null) {
      return Write.done();
    } else {
      return new WriteDone<T>(result);
    }
  }

  /**
   * Returns a {@code Write} instance in the <em>error</em> state that wraps
   * the given write {@code error}.
   */
  @CheckReturnValue
  public static <T> Write<T> error(Throwable error) {
    return new WriteError<T>(error);
  }

}

final class WriteDone<T> extends Write<T> implements ToSource {

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

  @Override
  public Result<T> toResult() {
    return Result.success(this.value);
  }

  @Override
  public <T2> Write<T2> andThen(Write<T2> that) {
    return that;
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
    return this.toSource();
  }

}

final class WriteError<T> extends Write<T> implements ToSource {

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
  public @Nullable T get() {
    throw new WriteException("Write failed", this.error);
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
  public Result<T> toResult() {
    return Result.failure(this.error);
  }

  @Override
  public <T2> Write<T2> andThen(Write<T2> that) {
    return Assume.conforms(this);
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
    return this.toSource();
  }

}

final class WriteAndThen<T> extends Write<T> implements ToSource {

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
