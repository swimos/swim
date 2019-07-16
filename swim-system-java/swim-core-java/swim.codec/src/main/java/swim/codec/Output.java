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
 * Non-blocking token stream writer.  {@code Output} enables incremental,
 * interruptible writing of network protocols and data formats.
 *
 * <h3>Output tokens</h3>
 * <p>Output tokens are modeled as primitive {@code int}s, commonly
 * representing Unicode code points, or raw octets; each {@code Output}
 * implementation specifies the semantic type of its tokens.</p>
 *
 * <h3>Output states</h3>
 * <p>{@code Output} is always in one of four states: <em>cont</em>inue,
 * <em>full</em>, <em>done</em>, or <em>error</em>.  The <em>cont</em> state
 * indicates that the stream is ready to write a single token; the <em>full</em>
 * state indicates that the stream is unable to write additional tokens at this
 * time, but that the stream may logically resume at some point in the future;
 * and the <em>done</em> state indicates that the stream has terminated, and
 * that {@link #bind() bind} will return the output result; and the
 * <em>error</em> state indicates that the stream has terminated abnormally.
 * {@link #isCont()} returns {@code true} when in the <em>cont</em> state;
 * {@link #isFull()} returns {@code true} when in the <em>full</em> state;
 * {@link #isDone()} returns {@code true} when in the <em>done</em> state; and
 * {@link #isError()} returns {@code true} when in the <em>error</em> state.</p>
 *
 * <h3>Output results</h3>
 * <p>An {@code Output} yields a value of type {@code T}, obtained via the
 * {@link #bind()} method, representing some implementation defined result of
 * writing the output.  For example, an {@code Output<String>} implementation
 * may–but is not required to–yield a {@code String} containing all code points
 * written to the output.</p>
 *
 * <h3>Non-blocking behavior</h3>
 * <p>{@code Output} writers never block.  An {@code Output} that would
 * otherwise block writing additional output instead enters the <em>full</em>
 * state, signaling the output generator to back off producing the output, but
 * to remain prepared to produce additional output in the future.  An {@code
 * Output} enters the <em>done</em> state when it encounters the final enf of
 * its output, signaling to the output generator to stop producing.</p>
 *
 * <h3>Output settings</h3>
 * <p>An output generator may alter the tokens it produces based on its {@code
 * Output}'s {@link #settings() settings}.  Uses include pretty printing and
 * styling generated output.  {@link OutputSettings} subclasses can provide
 * additional parameters understood by specialized output producers.</p>
 *
 * <h3>Cloning</h3>
 * <p>An {@code Output} may be {@link #clone() cloned} to branch the token
 * stream in an implementation specified manner.  Not all {@code Output}
 * implementations support cloning.</p>
 *
 * @see OutputSettings
 * @see Writer
 */
public abstract class Output<T> {
  /**
   * Returns {@code true} when the next {@link #write(int)} will succeed.
   * i.e. this {@code Output} is in the <em>cont</em> state.
   */
  public abstract boolean isCont();

  /**
   * Returns {@code true} when an immediate {@code write} will fail,
   * but writes may succeed at some point in the future.  i.e. this
   * {@code Output} is in the <em>full</em> state.
   */
  public abstract boolean isFull();

  /**
   * Returns {@code true} when no {@code write} will ever again suucced.
   * i.e. this {@code Output} is in the <em>done</em> state.
   */
  public abstract boolean isDone();

  /**
   * Returns {@code true} when an immediate {@code write} will fail due to an
   * error with the token stream.  i.e. this {@code Output} is in the
   * <em>error</em> state.  When {@code true}, {@link #trap()} will return the
   * output error.
   */
  public abstract boolean isError();

  /**
   * Returns {@code true} if this is a partial {@code Output} that will enter
   * the <em>full</em> state when it is unable to write additional tokens.
   */
  public abstract boolean isPart();

  /**
   * Returns a partial {@code Output} equivalent to this {@code Output}, if
   * {@code isPart} is {@code true}; returns a final {@code Output} equivalent
   * to this {@code Output} if {@code isPart} is {@code false}.  The caller's
   * reference to {@code this} {@code Output} should be replaced by the
   * returned {@code Output}.
   */
  public abstract Output<T> isPart(boolean isPart);

  /**
   * Writes a single {@code token} to the stream, if this {@code Output} is in
   * the <em>cont</em> state.  Returns an {@code Output} in the <em>error</em>
   * state if this {@code Output} is not in the <em>cont</em> state.  The
   * caller's reference to {@code this} {@code Output} should be replaced by
   * the returned {@code Output}.
   */
  public abstract Output<T> write(int token);

  /**
   * Writes the code points of the given {@code string}.  Assumes this is a
   * Unicode {@code Output} with sufficient capacity.  Returns an {@code
   * Output} in the <em>error</em> state if this {@code Output} exits the
   * <em>cont</em> state before the full {@code string} has been writtem.  The
   * caller's reference to {@code this} {@code Output} should be replaced by
   * the returned {@code Output}.
   */
  public Output<T> write(String string) {
    Output<T> output = this;
    final int n = string.length();
    for (int i = 0; i < n; i = string.offsetByCodePoints(i, 1)) {
      output = output.write(string.codePointAt(i));
    }
    return output;
  }

  /**
   * Writes the code points of the given {@code string}, followed by the code
   * points of the {@code settings}' {@link OutputSettings#lineSeparator()
   * line separator}.  Assumes this is a Unicode {@code Output} with sufficient
   * capacity.  Returns an {@code Output} in the <em>error</em> state if this
   * {@code Output} exits the <em>cont</em> state before the full {@code
   * string} and line separator has been written.  The caller's reference to
   * {@code this} {@code Output} should be replaced by the returned {@code
   * Output}.
   */
  public Output<T> writeln(String string) {
    return write(string).writeln();
  }

  /**
   * Writes the code points of the {@code settings}'
   * {@link OutputSettings#lineSeparator() line separator}.  Assumes this is a
   * Unicode {@code Output} with sufficient capacity.  Returns an {@code
   * Output} in the <em>error</em> state if this {@code Output} exits the
   * <em>cont</em> state before the full line separator has been written.  The
   * caller's reference to {@code this} {@code Output} should be replaced by
   * the returned {@code Output}.
   */
  public Output<T> writeln() {
    return write(settings().lineSeparator());
  }

  /**
   * Writes the code points of the human-readable {@link Display} string
   * of the given {@code object}.  Assumes this is a Unicode {@code Output}
   * with sufficient capacity.  Returns an {@code Output} in the <em>error</em>
   * state if this {@code Output} exits the <em>contt</em> state before the
   * full display string has been written.  The caller's reference to {@code
   * this} {@code Output} should be replaced by the returned {@code Output}.
   */
  public Output<T> display(Object object) {
    Format.display(object, this);
    return this;
  }

  /**
   * Writes the code points of the developer-readable {@link Debug} string
   * of the given {@code object}.  Assumes this is a Unicode {@code Output}
   * with sufficient capacity.  Returns an {@code Output} in the <em>error</em>
   * state if this {@code Output} exits the <em>contt</em> state before the
   * full debug string has been written.  The caller's reference to {@code
   * this} {@code Output} should be replaced by the returned {@code Output}.
   */
  public Output<T> debug(Object object) {
    Format.debug(object, this);
    return this;
  }

  /**
   * Writes any internally buffered state to the underlying output stream.
   */
  public Output<T> flush() {
    return this;
  }

  /**
   * Returns an {@code Output} equivalent to this {@code Output}, but whose
   * behavior may be altered by the given out-of-band {@code condition}.  The
   * caller's reference to {@code this} {@code Output} should be replaced by
   * the returned {@code Output}.
   */
  public Output<T> fork(Object condition) {
    return this;
  }

  /**
   * Returns the implementation-defined result of writing the output.
   */
  public abstract T bind();

  /**
   * Returns the output error.  Only guaranteed to return an error when in the
   * <em>error</em> state.
   *
   * @throws OutputException if this {@code Output} is not in the
   *         <em>error</em> state.
   */
  public Throwable trap() {
    throw new OutputException();
  }

  /**
   * Returns the {@code OutputSettings} used to configure the behavior of
   * output producers that write to this {@code Output}.
   */
  public abstract OutputSettings settings();

  /**
   * Updates the {@code settings} associated with this {@code Output}.
   *
   * @return {@code this}
   */
  public abstract Output<T> settings(OutputSettings settings);

  /**
   * Returns an implementation-defined branch of the token stream.
   *
   * @throws UnsupportedOperationException if this {@code Output} cannot be
   *         cloned.
   */
  @Override
  public Output<T> clone() {
    throw new UnsupportedOperationException();
  }

  private static Output<Object> full;

  private static Output<Object> done;

  /**
   * Returns an {@code Output} in the <em>full</em> state, that binds a {@code
   * null} result.
   */
  @SuppressWarnings("unchecked")
  public static <T> Output<T> full() {
    if (full == null) {
      full = new OutputFull<Object>(null, OutputSettings.standard());
    }
    return (Output<T>) full;
  }

  /**
   * Returns an {@code Output} in the <em>full</em> state, with the given
   * {@code settings}.
   */
  public static <T> Output<T> full(OutputSettings settings) {
    if (settings == OutputSettings.standard()) {
      return full();
    }
    return new OutputFull<T>(null, settings);
  }

  /**
   * Returns an {@code Output} in the <em>full</em> state, that binds the given
   * {@code value}.
   */
  public static <T> Output<T> full(T value) {
    if (value == null) {
      return full();
    }
    return new OutputFull<T>(value, OutputSettings.standard());
  }

  /**
   * Returns an {@code Output} in the <em>full</em> state, that binds the given
   * {@code value}, with the given {@code settings}.
   */
  public static <T> Output<T> full(T value, OutputSettings settings) {
    if (value == null && settings == OutputSettings.standard()) {
      return full();
    }
    return new OutputFull<T>(value, settings);
  }

  /**
   * Returns an {@code Output} in the <em>done</em> state, that binds a {@code
   * null} result.
   */
  @SuppressWarnings("unchecked")
  public static <T> Output<T> done() {
    if (done == null) {
      done = new OutputDone<Object>(null, OutputSettings.standard());
    }
    return (Output<T>) done;
  }

  /**
   * Returns an {@code Output} in the <em>done</em> state, with the given {@code
   * settings}.
   */
  public static <T> Output<T> done(OutputSettings settings) {
    if (settings == OutputSettings.standard()) {
      return done();
    }
    return new OutputDone<T>(null, settings);
  }

  /**
   * Returns an {@code Output} in the <em>done</em> state, that binds the given
   * {@code value}.
   */
  public static <T> Output<T> done(T value) {
    if (value == null) {
      return done();
    }
    return new OutputDone<T>(value, OutputSettings.standard());
  }

  /**
   * Returns an {@code Output} in the <em>done</em> state, that binds the given
   * {@code value}, with the given {@code settings}.
   */
  public static <T> Output<T> done(T value, OutputSettings settings) {
    if (value == null && settings == OutputSettings.standard()) {
      return done();
    }
    return new OutputDone<T>(value, settings);
  }

  /**
   * Returns an {@code Output} in the <em>error</em> state, with the given
   * output {@code error}.
   */
  public static <T> Output<T> error(Throwable error) {
    return new OutputError<T>(error, OutputSettings.standard());
  }

  /**
   * Returns an {@code Output} in the <em>error</em> state, with the given
   * output {@code error} and {@code settings}.
   */
  public static <T> Output<T> error(Throwable error, OutputSettings settings) {
    return new OutputError<T>(error, settings);
  }
}

final class OutputFull<T> extends Output<T> {
  final T value;
  final OutputSettings settings;

  OutputFull(T value, OutputSettings settings) {
    this.value = value;
    this.settings = settings;
  }

  @Override
  public boolean isCont() {
    return false;
  }

  @Override
  public boolean isFull() {
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
  public Output<T> isPart(boolean isPart) {
    if (isPart) {
      return Output.done(this.value, this.settings);
    } else {
      return this;
    }
  }

  @Override
  public Output<T> write(int token) {
    return Output.error(new OutputException("full"), this.settings);
  }

  @Override
  public Output<T> write(String string) {
    return Output.error(new OutputException("full"), this.settings);
  }

  @Override
  public Output<T> writeln(String string) {
    return Output.error(new OutputException("full"), this.settings);
  }

  @Override
  public Output<T> writeln() {
    return Output.error(new OutputException("full"), this.settings);
  }

  @Override
  public T bind() {
    return this.value;
  }

  @Override
  public OutputSettings settings() {
    return this.settings;
  }

  @Override
  public Output<T> settings(OutputSettings settings) {
    return Output.full(this.value, settings);
  }

  @Override
  public Output<T> clone() {
    return this;
  }
}

final class OutputDone<T> extends Output<T> {
  final T value;
  final OutputSettings settings;

  OutputDone(T value, OutputSettings settings) {
    this.value = value;
    this.settings = settings;
  }

  @Override
  public boolean isCont() {
    return false;
  }

  @Override
  public boolean isFull() {
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
  public Output<T> isPart(boolean isPart) {
    if (isPart) {
      return this;
    } else {
      return Output.full(this.value, this.settings);
    }
  }

  @Override
  public Output<T> write(int token) {
    return Output.error(new OutputException("done"), this.settings);
  }

  @Override
  public Output<T> write(String string) {
    return Output.error(new OutputException("done"), this.settings);
  }

  @Override
  public Output<T> writeln(String string) {
    return Output.error(new OutputException("done"), this.settings);
  }

  @Override
  public Output<T> writeln() {
    return Output.error(new OutputException("done"), this.settings);
  }

  @Override
  public T bind() {
    return this.value;
  }

  @Override
  public OutputSettings settings() {
    return this.settings;
  }

  @Override
  public Output<T> settings(OutputSettings settings) {
    return Output.done(this.value, settings);
  }

  @Override
  public Output<T> clone() {
    return this;
  }
}

final class OutputError<T> extends Output<T> {
  final Throwable error;
  final OutputSettings settings;

  OutputError(Throwable error, OutputSettings settings) {
    this.error = error;
    this.settings = settings;
  }

  @Override
  public boolean isCont() {
    return false;
  }

  @Override
  public boolean isFull() {
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
  public Output<T> isPart(boolean isPart) {
    return this;
  }

  @Override
  public Output<T> write(int token) {
    return this;
  }

  @Override
  public Output<T> write(String string) {
    return this;
  }

  @Override
  public Output<T> writeln(String string) {
    return this;
  }

  @Override
  public Output<T> writeln() {
    return this;
  }

  @Override
  public T bind() {
    return null;
  }

  @Override
  public Throwable trap() {
    return this.error;
  }

  @Override
  public OutputSettings settings() {
    return this.settings;
  }

  @Override
  public Output<T> settings(OutputSettings settings) {
    return Output.error(this.error, settings);
  }

  @Override
  public Output<T> clone() {
    return this;
  }
}
