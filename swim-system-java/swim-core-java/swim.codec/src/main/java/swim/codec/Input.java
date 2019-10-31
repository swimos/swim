// Copyright 2015-2019 SWIM.AI inc.
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

/**
 * Non-blocking token stream reader, with single token lookahead.
 * {@code Input} enable incremental, interruptible parsing of network protocols
 * and data formats.
 *
 * <h3>Input tokens</h3>
 * <p>Input tokens are modeled as primitive {@code int}s, commonly representing
 * Unicode code points, or raw octets; each {@code Input} implementation
 * specifies the semantic type of its tokens.  The {@link #head()}  method
 * peeks at the current lookahead token, without consuming it, and the {@link
 * #step()} method advances the input to the next token.</p>
 *
 * <h3>Input states</h3>
 * <p>{@code Input} is always in one of four states: <em>cont</em>inue,
 * <em>empty</em>, <em>done</em>, or <em>error</em>.  The <em>cont</em> state
 * indicates that a lookahead token is immediately available; the <em>empty</em>
 * state indicates that no additional tokens are available at this time, but
 * that the stream may logically resume in the future; the <em>done</em> state
 * indicates that the stream has terminated nominally; and the <em>error</em>
 * state indicates that the stream has terminated abnormally.
 * {@link #isCont()} returns {@code true} when in the <em>cont</em> state;
 * {@link #isEmpty()} returns {@code true} when in the <em>empty</em> state;
 * {@link #isDone()} returns {@code true} when in the <em>done</em> state; and
 * {@link #isError()} returns {@code true} when in the <em>error</em> state.</p>
 *
 * <h3>Non-blocking semantics</h3>
 * <p>{@code Input} never blocks.  An {@code Input} that would otherwise block
 * awaiting additional tokens instead enters the <em>empty</em> state,
 * signaling the input consumer to back off processing the input, but to remain
 * prepared to process additional input in the future.  An {@code Input} enters
 * the <em>done</em> state when it encounters the final end of its input stream,
 * signaling the input consumer to terminate processing.</p>
 *
 * <p>{@link #isPart()} returns {@code true} if the {@code Input} will enter
 * the <em>empty</em> state after it consumes the last immediately available
 * token; it returns {@code false} if the {@code Input} will enter the
 * <em>done</em> state after it consumes the last immediately available token.</p>
 *
 * <p>{@link Input#empty()} returns an {@code Input} in the <em>empty</em>
 * state.  {@link Input#done()} returns an {@code Input} in the <em>done</em>
 * state.</p>
 *
 * <h3>Position tracking</h3>
 * <p>The logical position of the current lookahead token is made available via
 * the {@link #mark()} method, with optimized callouts for the byte {@link
 * #offset() offset}, one-based {@link #line() line} number, and one-based
 * {@link #column() column} in the current line.  The {@link #id()} method
 * returns a diagnostic identifier for the token stream.</p>
 *
 * <h3>Cloning</h3>
 * <p>An {@code Input} may be {@link #clone() cloned} to provide an indepently
 * mutable position into a shared token stream.  Not all {@code Input}
 * implementations support cloning.</p>
 *
 * @see InputSettings
 * @see Parser
 */
public abstract class Input {
  /**
   * Returns {@code true} when a {@link #head() lookeahead} token is
   * immediately available.  i.e. this {@code Input} is in the <em>cont</em>
   * state.
   */
  public abstract boolean isCont();

  /**
   * Returns {@code true} when no lookahead token is currently available, but
   * additional input may be available in the future.  i.e. this {@code Input}
   * is in the <em>empty</em> state.
   */
  public abstract boolean isEmpty();

  /**
   * Returns {@code true} when no lookahead token is currently available, and
   * no additional input will ever become available.  i.e. this {@code Input}
   * is in the <em>done</em> state.
   */
  public abstract boolean isDone();

  /**
   * Returns {@code true} when no lookahead token is currently available due to
   * an error with the token stream.  i.e. this {@code Input} is in the
   * <em>error</em> state.  When {@code true}, {@link #trap()} will return the
   * input error.
   */
  public abstract boolean isError();

  /**
   * Returns {@code true} if this is a partial {@code Input} will that enter
   * the <em>empty</em> state after it consumes the last available input token.
   */
  public abstract boolean isPart();

  /**
   * Returns a partial {@code Input} equivalent to this {@code Input}, if
   * {@code isPart} is {@code true}; returns a final {@code Input} equivalent
   * to this {@code Input} if {@code isPart} is {@code false}.  The caller's
   * reference to {@code this} {@code Input} should be replaced by the returned
   * {@code Input}.
   */
  public abstract Input isPart(boolean isPart);

  /**
   * Returns the current lookahead token, if this {@code Input} is in the
   * <em>cont</em> state.
   *
   * @throws InputException if this {@code Input} is not in the <em>cont</em>
   *         state.
   */
  public abstract int head();

  /**
   * Returns an {@code Input} equivalent to this {@code Input}, but advanced to
   * the next token.  Returns an {@code Input} in the <em>error</em> state if
   * this {@code Input} is not in the <em>cont</em> state.  The caller's
   * reference to {@code this} {@code Input} should be replaced by the returned
   * {@code Input}.
   */
  public abstract Input step();

  /**
   * Returns an {@code Input} equivalent to this {@code Input}, but
   * repositioned to the given {@code mark}.  Returns an {@code Input} in the
   * <em>error</em> state if this {@code Input} does not support seeking, or if
   * this {@code Input} is unable to reposition to the given {@code mark}.  The
   * caller's reference to {@code this} {@code Input} should be replaced by the
   * returned {@code Input}.
   */
  public abstract Input seek(Mark mark);

  /**
   * Returns an {@code Input} equivalent to this {@code Input}, but whose
   * behavior may be altered by the given out-of-band {@code condition}.  The
   * caller's reference to {@code this} {@code Input} should be replaced by the
   * returned {@code Input}.
   */
  public Input fork(Object condition) {
    return this;
  }

  /**
   * Returns the input error.  Only guaranteed to return an error when in the
   * <em>error</em> state.
   *
   * @throws InputException if this {@code Input} is not in the <em>error</em>
   *         state.
   */
  public Throwable trap() {
    throw new InputException();
  }

  /**
   * Returns an object that identifies the token stream, or {@code null} if the
   * stream is unidentified.
   */
  public abstract Object id();

  /**
   * Returns an {@code Input} equivalent to this {@code Input}, but logically
   * identified by the given–possibly {@code null}–{@code id}.  The caller's
   * reference to {@code this} {@code Input} should be replaced by the returned
   * {@code Input}.
   */
  public abstract Input id(Object id);

  /**
   * Returns the position of the current lookahead token, relative to the start
   * of the stream.
   */
  public abstract Mark mark();

  /**
   * Returns an {@code Input} equivalent to this {@code Input}, but logically
   * positioned at the given {@code mark}.  The physical position in the input
   * stream is not modified.  The caller's reference to {@code this} {@code
   * Input} should be replaced by the returned {@code Input}.
   */
  public abstract Input mark(Mark mark);

  /**
   * Returns the byte offset of the current lookahead token, relative to the
   * start of the stream.
   */
  public long offset() {
    return mark().offset;
  }

  /**
   * Returns the one-based line number of the current lookahead token, relative
   * to the start of the stream.
   */
  public int line() {
    return mark().line;
  }

  /**
   * Returns the one-based column number of the current lookahead token,
   * relative to the current line in the stream.
   */
  public int column() {
    return mark().column;
  }

  /**
   * Returns the {@code InputSettings} used to configure the behavior of input
   * consumers that read from this {@code Input}.
   */
  public abstract InputSettings settings();

  /**
   * Returns an {@code Input} equivalent to this {@code Input}, but with the
   * given input {@code settings}.  The caller's reference to {@code this}
   * {@code Input} should be replaced by the returned {@code Input}.
   */
  public abstract Input settings(InputSettings settings);

  /**
   * Returns an independently positioned view into the token stream,
   * initialized with identical state to this {@code Input}.
   *
   * @throws UnsupportedOperationException if this {@code Input} cannot be
   *         cloned.
   */
  @Override
  public abstract Input clone();

  private static Input empty;

  private static Input done;

  /**
   * Returns an {@code Input} in the <em>empty</em> state.
   */
  public static Input empty() {
    if (empty == null) {
      empty = new InputEmpty(null, Mark.zero(), InputSettings.standard());
    }
    return empty;
  }

  /**
   * Returns an {@code Input} in the <em>empty</em> state, with the given
   * {@code settings}.
   */
  public static Input empty(InputSettings settings) {
    if (settings == InputSettings.standard()) {
      return empty();
    }
    return new InputEmpty(null, Mark.zero(), settings);
  }

  /**
   * Returns an {@code Input} in the <em>empty</em> state, at the {@code mark}
   * position of a token stream logically identified by {@code id}.
   */
  public static Input empty(Object id, Mark mark) {
    if (id == null && (mark == null || mark == Mark.zero())) {
      return empty();
    }
    return new InputEmpty(id, mark, InputSettings.standard());
  }

  /**
   * Returns an {@code Input} in the <em>empty</em> state, at the {@code mark}
   * position of a token stream logically identified by {@code id}, with the
   * given {@code settings}.
   */
  public static Input empty(Object id, Mark mark, InputSettings settings) {
    if (id == null && (mark == null || mark == Mark.zero()) && settings == InputSettings.standard()) {
      return empty();
    }
    return new InputEmpty(id, mark, settings);
  }

  /**
   * Returns an {@code Input} in the <em>done</em> state.
   */
  public static Input done() {
    if (done == null) {
      done = new InputDone(null, Mark.zero(), InputSettings.standard());
    }
    return done;
  }

  /**
   * Returns an {@code Input} in the <em>done</em> state, with the given {@code
   * settings}.
   */
  public static Input done(InputSettings settings) {
    if (settings == InputSettings.standard()) {
      return done();
    }
    return new InputDone(null, Mark.zero(), settings);
  }

  /**
   * Returns an {@code Input} in the <em>done</em> state, at the {@code mark}
   * position of a token stream logically identified by {@code id}.
   */
  public static Input done(Object id, Mark mark) {
    if (id == null && (mark == null || mark == Mark.zero())) {
      return done();
    }
    return new InputDone(id, mark, InputSettings.standard());
  }

  /**
   * Returns an {@code Input} in the <em>done</em> state, at the {@code mark}
   * position of a token stream logically identified by {@code id}, with the
   * given {@code settings}.
   */
  public static Input done(Object id, Mark mark, InputSettings settings) {
    if (id == null && (mark == null || mark == Mark.zero()) && settings == InputSettings.standard()) {
      return done();
    }
    return new InputDone(id, mark, settings);
  }

  /**
   * Returns an {@code Input} in the <em>error</em> state, with the given input
   * {@code error}.
   */
  public static Input error(Throwable error) {
    return new InputError(error, null, Mark.zero(), InputSettings.standard());
  }

  /**
   * Returns an {@code Input} in the <em>error</em> state, with the given input
   * {@code error} and {@code settings}.
   */
  public static Input error(Throwable error, InputSettings settings) {
    return new InputError(error, null, Mark.zero(), settings);
  }

  /**
   * Returns an {@code Input} in the <em>error</em> state, with the given input
   * {@code error}, at the {@code mark} position of a token stream logically
   * identified by {@code id}.
   */
  public static Input error(Throwable error, Object id, Mark mark) {
    return new InputError(error, id, mark, InputSettings.standard());
  }

  /**
   * Returns an {@code Input} in the <em>error</em> state, with the given input
   * {@code error}, at the {@code mark} position of a token stream logically
   * identified by {@code id}, with the given {@code settings}.
   */
  public static Input error(Throwable error, Object id, Mark mark, InputSettings settings) {
    return new InputError(error, id, mark, settings);
  }
}

final class InputEmpty extends Input {
  final Object id;
  final Mark mark;
  final InputSettings settings;

  InputEmpty(Object id, Mark mark, InputSettings settings) {
    this.id = id;
    this.mark = mark;
    this.settings = settings;
  }

  @Override
  public boolean isCont() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return true;
  }

  @Override
  public boolean isDone() {
    return false;
  }

  @Override
  public boolean isError() {
    return false;
  }

  @Override
  public boolean isPart() {
    return true;
  }

  @Override
  public Input isPart(boolean isPart) {
    if (isPart) {
      return this;
    } else {
      return Input.done(this.id, this.mark, this.settings);
    }
  }

  @Override
  public int head() {
    throw new InputException();
  }

  @Override
  public Input step() {
    final Throwable error = new InputException("empty step");
    return Input.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Input fork(Object condition) {
    if (condition instanceof Input) {
      return (Input) condition;
    }
    return this;
  }

  @Override
  public Input seek(Mark mark) {
    final Throwable error = new InputException("empty seek");
    return Input.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Object id() {
    return this.id;
  }

  @Override
  public Input id(Object id) {
    return Input.empty(id, this.mark, this.settings);
  }

  @Override
  public Mark mark() {
    return this.mark;
  }

  @Override
  public Input mark(Mark mark) {
    return Input.empty(this.id, mark, this.settings);
  }

  @Override
  public InputSettings settings() {
    return this.settings;
  }

  @Override
  public Input settings(InputSettings settings) {
    return Input.empty(this.id, this.mark, settings);
  }

  @Override
  public Input clone() {
    return this;
  }
}

final class InputDone extends Input {
  final Object id;
  final Mark mark;
  final InputSettings settings;

  InputDone(Object id, Mark mark, InputSettings settings) {
    this.id = id;
    this.mark = mark;
    this.settings = settings;
  }

  @Override
  public boolean isCont() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public boolean isDone() {
    return true;
  }

  @Override
  public boolean isError() {
    return false;
  }

  @Override
  public boolean isPart() {
    return false;
  }

  @Override
  public Input isPart(boolean isPart) {
    if (isPart) {
      return Input.empty(this.id, this.mark, this.settings);
    } else {
      return this;
    }
  }

  @Override
  public int head() {
    throw new InputException();
  }

  @Override
  public Input step() {
    final Throwable error = new InputException("done step");
    return Input.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Input seek(Mark mark) {
    final Throwable error = new InputException("empty seek");
    return Input.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Object id() {
    return this.id;
  }

  @Override
  public Input id(Object id) {
    return Input.done(id, this.mark, this.settings);
  }

  @Override
  public Mark mark() {
    return this.mark;
  }

  @Override
  public Input mark(Mark mark) {
    return Input.done(this.id, mark, this.settings);
  }

  @Override
  public InputSettings settings() {
    return this.settings;
  }

  @Override
  public Input settings(InputSettings settings) {
    return Input.done(this.id, this.mark, settings);
  }

  @Override
  public Input clone() {
    return this;
  }
}

final class InputError extends Input {
  final Throwable error;
  final Object id;
  final Mark mark;
  final InputSettings settings;

  InputError(Throwable error, Object id, Mark mark, InputSettings settings) {
    this.error = error;
    this.id = id;
    this.mark = mark;
    this.settings = settings;
  }

  @Override
  public boolean isCont() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public boolean isDone() {
    return false;
  }

  @Override
  public boolean isError() {
    return true;
  }

  @Override
  public boolean isPart() {
    return false;
  }

  @Override
  public Input isPart(boolean isPart) {
    return this;
  }

  @Override
  public int head() {
    throw new InputException();
  }

  @Override
  public Input step() {
    final Throwable error = new InputException("error step");
    return Input.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Throwable trap() {
    return this.error;
  }

  @Override
  public Input seek(Mark mark) {
    final Throwable error = new InputException("error seek");
    return Input.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Object id() {
    return this.id;
  }

  @Override
  public Input id(Object id) {
    return Input.error(this.error, id, this.mark, this.settings);
  }

  @Override
  public Mark mark() {
    return this.mark;
  }

  @Override
  public Input mark(Mark mark) {
    return Input.error(this.error, this.id, mark, this.settings);
  }

  @Override
  public InputSettings settings() {
    return this.settings;
  }

  @Override
  public Input settings(InputSettings settings) {
    return Input.error(this.error, this.id, this.mark, settings);
  }

  @Override
  public Input clone() {
    return this;
  }
}
