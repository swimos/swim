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

import swim.annotations.CheckReturnValue;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A non-blocking chunked input stream. {@code Input} facilitates
 * interruptible parsing of network protocols and data formats.
 *
 * <h2>Input tokens</h2>
 * <p>
 * Input tokens are modeled as primitive {@code int} values, commonly
 * representing Unicode code points, or raw octets. The semantics of
 * input tokens is specified by individual {@code Input} subclasses.
 * <p>
 * The {@link #head()} method peeks at the current lookahead token,
 * without consuming it. The {@link #step()} method advances the input
 * to the next state.
 *
 * <h2>Input states</h2>
 * <p>
 * An {@code Input} instance is always in one—and only one—of the following
 * four <em>input states</em>:
 * <ul>
 * <li>{@link #isCont() input-cont}: an input token is available
 *     at the {@link #head()} of the input stream
 * <li>{@link #isEmpty() input-empty}: the input stream has reached
 *     the end of the current input chunk
 * <li>{@link #isDone() input-done}: the input stream has reached
 *     the end of the last input chunk
 * <li>{@link #isError() input-error}: the input stream terminated
 *     with an {@linkplain #getError() input error}
 * </ul>
 *
 * <h2>Input chunks</h2>
 * <p>
 * {@code Input} methods never block. An input stream that would otherwise
 * need to block awaiting additional input instead enters the {@code input-empty}
 * state, signaling the input consumer to asynchronously wait for additional
 * input before continuing. If no additional input will ever become available,
 * the input stream enters the {@code input-done} state, signaling the input
 * consumer to terminate. The {@link #isLast()} method indicates whether the
 * input stream will enter the {@code input-empty} state or the {@code input-done}
 * state when it reaches the end of the current input chunk.
 *
 * <h2>Position tracking</h2>
 * <p>
 * The logical location of the current lookahead token is made available via
 * the {@link #location()} method, with convenience accessors for the byte
 * {@linkplain #offset() offset}, one-based {@linkplain #line() line} number,
 * and one-based {@linkplain #column() column} in the current line. The
 * {@link #name()} method returns an optional name for the input source.
 *
 * <h2>Cloning</h2>
 * <p>
 * An input stream may be {@linkplain #clone() cloned} to provide an
 * independently mutable position into a shared input chunk. Not all
 * {@code Input} implementations support cloning.
 *
 * @see Parser
 * @see InputBuffer
 */
@Public
@Since("5.0")
public abstract class Input {

  /**
   * Constructs a new {@code Input} instance.
   */
  protected Input() {
    // nop
  }

  /**
   * Returns {@code true} when in the {@code input-cont} state, with an
   * input token available at the {@link #head()} of the input stream
   *
   * @return whether or not this {@code Input} instance is
   *         in the {@code input-cont} state
   */
  public abstract boolean isCont();

  /**
   * Returns {@code true} when in the {@code input-done} state,
   * having reached the end of the current input chunk.
   *
   * @return whether or not this {@code Input} instance is
   *         in the {@code input-done} state
   */
  public abstract boolean isEmpty();

  /**
   * Returns {@code true} when in the {@code input-done} state,
   * having reached the end of the last input chunk.
   *
   * @return whether or not this {@code Input} instance is
   *         in the {@code input-done} state
   */
  public abstract boolean isDone();

  /**
   * Returns {@code true} when in the {@code input-error} state,
   * having terminated with an {@linkplain #getError() input error}.
   *
   * @return whether or not this {@code Input} instance is
   *         in the {@code input-error} state
   */
  public abstract boolean isError();

  /**
   * Returns {@code true} when in either the {@code input-cont} state
   * or the {@code input-done} state, indicating that parsing can
   * potentially make further progress.
   *
   * @return whether or not this {@code Input} instance is in either the
   *         {@code input-cont} state or the {@code input-done} state
   */
  public boolean isReady() {
    return this.isCont() || this.isDone();
  }

  /**
   * Returns {@code true} when in either the {@code input-empty} state
   * or the {@code input-error} state, indicating that parsing can't
   * make further progress at this time.
   *
   * @return whether or not this {@code Input} instance is in either the
   *         {@code input-empty} state or the {@code input-error} state
   */
  public boolean isBreak() {
    return this.isEmpty() || this.isError();
  }

  /**
   * Returns {@code true} if this input stream will enter the
   * {@code input-done} state when it reaches the end of the current
   * input chunk; otherwise returns {@code false} if the input stream
   * will enter the {@code input-empty} state when it reaches the end
   * of the current input chunk.
   *
   * @return whether this input stream will enter the {@code input-done}
   *         state or the {@code input-empty} state when it reaches the end
   *         of the current input chunk
   */
  public abstract boolean isLast();

  /**
   * Sets the {@link #isLast()} flag to {@code last} and returns {@code this}.
   * If {@code last} is {@code true}, the input stream will enter the
   * {@code input-done} state when it reaches the end of the current
   * input chunk; if {@code last} is {@code false}, the input stream
   * will enter the {@code input-empty} state when it reaches the end
   * of the current input chunk.
   *
   * @param last whether the input stream should enter the {@code input-done}
   *        state or the {@code input-empty} state when it reaches the end
   *        of the current input chunk
   * @return {@code this}
   */
  public abstract Input asLast(boolean last);

  /**
   * Returns the current lookahead token, if in the {@code input-cont} state.
   *
   * @return the current lookahead token, if available
   * @throws IllegalStateException if not in the {@code input-cont} state
   */
  public abstract int head();

  /**
   * Returns the {@code k}-th lookahead token, if available; otherwise returns
   * {@code -1} if fewer than {@code k + 1} lookahead tokens are available in
   * the current input chunk, or if the input stream doesn't support
   * multi-token lookahead.
   *
   * @param k the offset from the current position in the input chunk
   *        of the token to return
   * @return the input token {@code k} steps forward in the input chunk,
   *         or {@code -1} if the lookahead token is not available
   */
  public abstract int lookahead(int k);

  /**
   * Consumes the current lookahead token, advances the input stream
   * to the next state, and returns {@code this}.
   *
   * @return {@code this}
   * @throws IllegalStateException if not in the {@code input-cont} state
   */
  public abstract Input step();

  /**
   * Sets the current position of this {@code Input} instance to the given
   * {@code position} in the input stream and returns {@code this}.
   *
   * @param position the position in the input stream from which
   *        input tokens should be consumed
   * @return {@code this}
   * @throws UnsupportedOperationException if the input stream
   *         does not support seeking
   * @throws IllegalArgumentException when attempting to seek
   *         to an invalid source {@code position}
   */
  public abstract Input seek(@Nullable SourcePosition position);

  /**
   * Returns the logical location of the current lookahead token
   * in the input stream.
   *
   * @return the source position of the current lookahead token
   *         in the input stream
   */
  public abstract SourcePosition location();

  /**
   * Sets the logical location of the current lookahead token to the given
   * {@code location} in the input stream and returns {@code this}.
   * This method does not seek the stream; it's used to offset
   * source positions of continued input chunks.
   *
   * @param location the source position of the current lookahead token
   *        in the input stream
   * @return {@code this}
   */
  public abstract Input location(SourcePosition location);

  /**
   * Returns a name for the source of this input stream,
   * or {@code null} if the input source is unnamed.
   *
   * @return the name of the source of this input stream
   */
  public @Nullable String name() {
    return this.location().name();
  }

  /**
   * Sets the name of the source of this input stream and returns {@code this}.
   *
   * @param name the name to use for the source of this input stream
   * @return {@code this}
   */
  public abstract Input name(@Nullable String name);

  /**
   * Returns the byte offset of the current lookahead token
   * relative to the start of the input stream.
   *
   * @return the byte offset of the current location in the input stream
   */
  public long offset() {
    return this.location().offset();
  }

  /**
   * Returns the one-based line number of the current lookahead token
   * relative to the start of the input stream.
   *
   * @return the line number of the current location in the input stream
   */
  public int line() {
    return this.location().line();
  }

  /**
   * Returns the one-based column number of the current lookahead token
   * relative to the current line in the input stream.
   *
   * @return the column number of the current location in the input stream
   */
  public int column() {
    return this.location().column();
  }

  /**
   * Returns the input error, if in the {@code input-error} state;
   * otherwise throws an unchecked exception.
   *
   * @return the input error, if present
   * @throws IllegalStateException if not in the {@code input-error} state
   */
  @CheckReturnValue
  public Throwable getError() {
    throw new IllegalStateException("no input error");
  }

  /**
   * Returns an independently positioned view of the input stream,
   * initialized with identical state to this {@code Input} instance.
   *
   * @return a new {@code Input} instance that is independent
   *         of this input stream
   * @throws UnsupportedOperationException if this input stream
   *         can't be cloned
   */
  @Override
  public abstract Input clone();

}
