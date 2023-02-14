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
import java.util.function.Supplier;
import swim.annotations.CheckReturnValue;
import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Non-blocking token stream writer. {@code Output} enables incremental,
 * interruptible writing of network protocols and data formats.
 *
 * <h3>Output tokens</h3>
 * <p>
 * Output tokens are modeled as primitive {@code int}s, typically representing
 * Unicode code points or raw octets. Each {@code Output} implementation
 * specifies the semantics of its tokens.
 *
 * <h3>Output states</h3>
 * <p>
 * {@code Output} is always in one of four states: <em>cont</em>inue,
 * <em>full</em>, <em>done</em>, or <em>error</em>. The <em>cont</em> state
 * indicates that the stream is ready to write a token. The <em>full</em> state
 * indicates that the stream is unable to accept additional tokens at this time,
 * but the stream may accept additional tokens at some point in the future, The
 * <em>done</em> state indicates that the stream will never accept additional
 * tokens, and the output result can be obtained by calling {@link #get()}.
 * The <em>error</em> state indicates that the stream has failed with an error,
 * and an exception can be obtained by invoking the {@link #getError()} method.
 * {@link #isCont()} returns {@code true} when in the <em>cont</em> state;
 * {@link #isFull()} returns {@code true} when in the <em>full</em> state;
 * {@link #isDone()} returns {@code true} when in the <em>done</em> state; and
 * {@link #isError()} returns {@code true} when in the <em>error</em> state.
 *
 * <h3>Output results</h3>
 * <p>
 * An {@code Output} yields a value of type {@code T}, obtained via the
 * {@link #get()} method, representing some implementation defined result
 * of the written output. For example, an {@code Output<String>} implementation
 * might–but is not required to–yield a {@code String} containing all Unicode
 * code points written to the output.
 *
 * <h3>Non-blocking behavior</h3>
 * <p>
 * {@code Output} methods never block. An output stream that would otherwise
 * need to block awaiting additional capacity instead enters the <em>full</em>
 * state, signaling the output producer to asynchronously wait for additional
 * output capacity before continuing. If no additional output capacity will
 * ever become available, the output stream enters the <em>done</em> state,
 * signaling the output producer to terminate.
 *
 * <h3>Cloning</h3>
 * <p>
 * An output stream may be {@linkplain #clone() cloned} to branch the token
 * stream in an implementation specified manner. Not all {@code Output}
 * implementations support cloning.
 *
 * @see Writer
 */
@Public
@Since("5.0")
public abstract class Output<T> implements Flushable {

  protected Output() {
    // nop
  }

  /**
   * Returns {@code true} when the next {@linkplain #write(int) write}
   * will succeed (the output is in the <em>cont</em> state).
   */
  public abstract boolean isCont();

  /**
   * Returns {@code true} when an immediate {@linkplain #write(int) write}
   * will fail, but writes may succeed at some point in the future
   * (the output is in the <em>full</em> state).
   */
  public abstract boolean isFull();

  /**
   * Returns {@code true} when no {@linkplain #write(int) write} will ever
   * again succeed because the output is in the <em>done</em> state).
   */
  public abstract boolean isDone();

  /**
   * Returns {@code true} when no {@linkplain #write(int) write} will ever
   * again succeed because the output is in the <em>error</em> state.
   * When {@code true}, {@link #getError()} will return the output exception.
   */
  public abstract boolean isError();

  /**
   * Returns {@code true} if in either the <em>cont</em> or <em>done<em> state,
   * indicating that writing can potentially make further progress.
   */
  public boolean isReady() {
    return this.isCont() || this.isDone();
  }

  /**
   * Returns {@code true} if in either the <em>full</em> or <em>error<em> state,
   * indicating that writing can't make further progress at this time.
   */
  public boolean isBreak() {
    return this.isFull() || this.isError();
  }

  /**
   * Returns {@code true} if the output will enter the <em>done</em> state
   * when it is unable to accept additional tokens, indicating that no
   * additional output capacity will be made available in the future. Returns
   * {@code false} if the output will enter the <em>full</em> state when it is
   * unable to accept additional tokens, indicating that additional output
   * capacity may be made available in the future.
   */
  public abstract boolean isLast();

  /**
   * Sets the {@link #isLast() last} flag and returns this output. If {@code
   * last} is set to {@code true}, the output will enter the <em>done</em>
   * state when it is unable to accept additional tokens, indicating that
   * no additional output capacity will be made available in the future.
   * If {@code last} is set to {@code false}, the output will enter the
   * <em>full</em> state when it is unable to accept additional tokens,
   * indicating that additional output capacity may be made available
   * in the future.
   */
  public abstract Output<T> asLast(boolean last);

  /**
   * Writes a single {@code token} to the output stream and returns {@code this}.
   *
   * @throws IllegalStateException if not in the <em>cont</em> state.
   */
  public abstract Output<T> write(int token);

  /**
   * Writes any internally buffered state to the underlying output stream.
   */
  @Override
  public void flush() {
    // nop
  }

  /**
   * Returns the output result. Only guaranteed to return a result when in the
   * <em>done</em> state.
   *
   * @throws IllegalStateException if not in the <em>done</em> state.
   */
  @CheckReturnValue
  public abstract @Nullable T get();

  /**
   * Returns the output result, if in the <em>done</em> state and the result
   * is non-{@code null}.
   *
   * @throws NullPointerException if the output result is {@code null}.
   * @throws IllegalStateException with any output error as its cause,
   *         if not in the <em>done</em> state.
   */
  @CheckReturnValue
  public @NonNull T getNonNull() {
    final T value = this.get();
    if (value != null) {
      return value;
    } else {
      throw new NullPointerException("Null output result");
    }
  }

  /**
   * Returns the output result, if in the <em>done</em> state,
   * otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  public @Nullable T getOr(@Nullable T other) {
    try {
      return this.get();
    } catch (IllegalStateException e) {
      return other;
    }
  }

  /**
   * Returns the output result, if in the <em>done</em> state and the result
   * is non-{@code null}; otherwise returns some {@code other} value.
   */
  @CheckReturnValue
  public @NonNull T getOrNonNull(@NonNull T other) {
    try {
      final T value = this.get();
      if (value != null) {
        return value;
      } else {
        return other;
      }
    } catch (IllegalStateException e) {
      return other;
    }
  }

  /**
   * Returns the output result, if in the <em>done</em> state, otherwise
   * returns the value produced by the given {@code supplier} function.
   */
  @CheckReturnValue
  public @Nullable T getOrElse(Supplier<? extends T> supplier) {
    try {
      return this.get();
    } catch (IllegalStateException e) {
      return supplier.get();
    }
  }

  /**
   * Returns the output error, if in the <em>error</em> state,
   * otherwise throws {@link IllegalStateException}.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  @CheckReturnValue
  public Throwable getError() {
    throw new IllegalStateException("No output error");
  }

  /**
   * Returns an implementation-defined branch of the token stream.
   *
   * @throws UnsupportedOperationException if this output can't be cloned.
   */
  @Override
  public Output<T> clone() {
    throw new UnsupportedOperationException();
  }

}
