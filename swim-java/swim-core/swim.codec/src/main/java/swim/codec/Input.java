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
 * Non-blocking token stream reader with single token lookahead.
 * {@code Input} enable incremental, interruptible parsing of network
 * protocols and data formats.
 *
 * <h3>Input tokens</h3>
 * <p>
 * Input tokens are modeled as primitive {@code int}s, typically representing
 * Unicode code points or raw octets. Each {@code Input} implementation
 * specifies the semantics of its tokens. The {@link #head()} method peeks
 * at the current lookahead token without consuming it. The {@link #step()}
 * method advances the input to the next state.
 *
 * <h3>Input states</h3>
 * <p>
 * {@code Input} is always in one of four states: <em>cont</em>inue,
 * <em>empty</em>, <em>done</em>, or <em>error</em>. The <em>cont</em> state
 * indicates that a lookahead token is immediately available. The <em>empty</em>
 * state indicates that no additional tokens are available at this time, but
 * that additional tokens may become available in the future. The <em>done</em>
 * state indicates that no additional tokens will ever become available.
 * The <em>error</em> state indicates that the stream has failed with an error,
 * and an exception can be obtained by invoking the {@link #getError()} method.
 * {@link #isCont()} returns {@code true} when in the <em>cont</em> state;
 * {@link #isEmpty()} returns {@code true} when in the <em>empty</em> state;
 * {@link #isDone()} returns {@code true} when in the <em>done</em> state; and
 * {@link #isError()} returns {@code true} when in the <em>error</em> state.
 *
 * <h3>Non-blocking semantics</h3>
 * <p>
 * {@code Input} methods never block. An input stream that would otherwise
 * need to block awaiting additional tokens instead enters the <em>empty</em>
 * state, signaling the input consumer to asynchronously wait for future tokens
 * before continuing. If no additional tokens will ever become available,
 * the input stream enters the <em>done</em> state, signaling the input
 * consumer to terminate.
 * <p>
 * {@link #isLast()} returns {@code true} if the input will enter the
 * <em>done</em> state after all immediately available tokens have been
 * consumed. {@code isLast()} returns {@code false} if the input will
 * enter the <em>empty</em> state after all immediately available tokens
 * have been consumed.
 *
 * <h3>Position tracking</h3>
 * <p>
 * The logical position of the current lookahead token is made available via
 * the {@link #position()} method, with convenience accessors for the byte
 * {@linkplain #offset() offset}, one-based {@linkplain #line() line} number,
 * and one-based {@linkplain #column() column} in the current line. The
 * {@link #identifier()} method returns an optional name for the token stream.
 *
 * <h3>Cloning</h3>
 * <p>
 * An input stream may be {@linkplain #clone() cloned} to provide an
 * independently mutable position into a shared token stream. Not all
 * {@code Input} implementations support cloning.
 *
 * @see Parser
 */
@Public
@Since("5.0")
public abstract class Input {

  protected Input() {
    // nop
  }

  /**
   * Returns {@code true} when a {@link #head() lookahead} token is
   * immediately available (the input is in the <em>cont</em> state).
   */
  public abstract boolean isCont();

  /**
   * Returns {@code true} when no lookahead token is currently available,
   * but additional input may be available in the future (the input is in
   * the <em>empty</em> state).
   */
  public abstract boolean isEmpty();

  /**
   * Returns {@code true} when no lookahead token is currently available,
   * and no additional input will ever become available because the input
   * is in the <em>done</em> state).
   */
  public abstract boolean isDone();

  /**
   * Returns {@code true} when no lookahead token is currently available,
   * and no additional input will ever become available because the input
   * is in the <em>error</em> state. When {@code true}, {@link #getError()}
   * will return the input exception.
   */
  public abstract boolean isError();

  /**
   * Returns {@code true} if in either the <em>cont</em> or <em>done<em> state,
   * indicating that parsing can potentially make further progress.
   */
  public boolean isReady() {
    return this.isCont() || this.isDone();
  }

  /**
   * Returns {@code true} if in either the <em>empty</em> or <em>error<em> state,
   * indicating that parsing can't make further progress at this time.
   */
  public boolean isBreak() {
    return this.isEmpty() || this.isError();
  }

  /**
   * Returns {@code true} if the input will enter the <em>done</em> state
   * after all available tokens have been consumed, indicating that no
   * additional input will be made available in the future. Returns {@code
   * false} if the input will enter the <em>empty</em> state after all
   * available tokens have been consumed, indicating that an additional
   * batch of input may be made available in the future.
   */
  public abstract boolean isLast();

  /**
   * Sets the {@link #isLast() last} flag and returns this input. If {@code
   * last} is set to {@code true}, the input will enter the <em>done</em> state
   * after all available tokens have been consumed, indicating that no
   * additional input will be made available in the future. If {@code last} is
   * set to {@code false}, the input will enter the <em>empty</em> state after
   * all available tokens have been consumed, indicating that an additional
   * batch of input may be made available in the future.
   */
  public abstract Input asLast(boolean last);

  /**
   * Returns the current lookahead token, if in the <em>cont</em> state.
   *
   * @throws IllegalStateException if not in the <em>cont</em> state.
   */
  public abstract int head();

  /**
   * Returns the {@code k}-th lookahead token, if available; returns {@code -1}
   * if fewer than {@code k + 1} lookahead tokens are available.
   */
  public abstract int lookahead(int k);

  /**
   * Advances the input to the next state and returns {@code this}.
   *
   * @throws IllegalStateException if not in the <em>cont</em> state.
   */
  public abstract Input step();

  /**
   * Repositions the input to the given {@code position} and returns {@code this}.
   *
   * @throws UnsupportedOperationException if the input does not support seeking.
   * @throws IllegalStateException if the input is unable to reposition
   *         to the given {@code position}.
   */
  public abstract Input seek(@Nullable SourcePosition position);

  /**
   * Returns the optional identifier string for this input stream.
   */
  public abstract @Nullable String identifier();

  /**
   * Sets the optional {@code identifier} string for this input stream
   * and returns {@code this}.
   */
  public abstract Input withIdentifier(@Nullable String identifier);

  /**
   * Returns the logical position of the current lookahead token relative to
   * the start of the stream.
   */
  public abstract SourcePosition position();

  /**
   * Sets the logical position of the input stream to the given {@code position},
   * without actually seeking the stream, and returns {@code this}.
   */
  public abstract Input withPosition(SourcePosition position);

  /**
   * Returns the byte offset of the current lookahead token
   * relative to the start of the stream.
   */
  public long offset() {
    return this.position().offset();
  }

  /**
   * Returns the one-based line number of the current lookahead token
   * relative to the start of the stream.
   */
  public int line() {
    return this.position().line();
  }

  /**
   * Returns the one-based column number of the current lookahead token
   * relative to the current line in the stream.
   */
  public int column() {
    return this.position().column();
  }

  /**
   * Returns the input error, if in the <em>error</em> state,
   * otherwise throws {@link IllegalStateException}.
   *
   * @throws IllegalStateException if not in the <em>error</em> state.
   */
  @CheckReturnValue
  public Throwable getError() {
    throw new IllegalStateException();
  }

  /**
   * Returns an independently positioned view into the input stream,
   * initialized with identical state to this input.
   *
   * @throws UnsupportedOperationException if this input can't be cloned.
   */
  @Override
  public abstract Input clone();

}
