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

import java.io.IOException;
import java.nio.channels.ReadableByteChannel;

/**
 * Non-blocking token stream buffer.
 */
public abstract class OutputBuffer<T> extends Output<T> {
  public abstract OutputBuffer<T> isPart(boolean isPart);

  public abstract int index();

  public abstract OutputBuffer<T> index(int index);

  public abstract int limit();

  public abstract OutputBuffer<T> limit(int limit);

  public abstract int capacity();

  public abstract int remaining();

  public abstract byte[] array();

  public abstract int arrayOffset();

  public abstract boolean has(int index);

  public abstract int get(int index);

  public abstract void set(int index, int token);

  public abstract int write(ReadableByteChannel channel) throws IOException;

  @Override
  public abstract OutputBuffer<T> write(int token);

  @Override
  public OutputBuffer<T> write(String string) {
    OutputBuffer<T> output = this;
    final int n = string.length();
    for (int i = 0; i < n; i = string.offsetByCodePoints(i, 1)) {
      output = output.write(string.codePointAt(i));
    }
    return output;
  }

  @Override
  public OutputBuffer<T> writeln(String string) {
    return write(string).writeln();
  }

  @Override
  public OutputBuffer<T> writeln() {
    return write(settings().lineSeparator());
  }

  @Override
  public OutputBuffer<T> display(Object object) {
    Format.display(object, this);
    return this;
  }

  @Override
  public OutputBuffer<T> debug(Object object) {
    Format.debug(object, this);
    return this;
  }

  public abstract OutputBuffer<T> move(int fromIndex, int toIndex, int length);

  public abstract OutputBuffer<T> step(int offset);

  @Override
  public OutputBuffer<T> flush() {
    return this;
  }

  @Override
  public OutputBuffer<T> fork(Object condition) {
    return this;
  }

  @Override
  public abstract OutputBuffer<T> settings(OutputSettings settings);

  @Override
  public OutputBuffer<T> clone() {
    throw new UnsupportedOperationException();
  }

  private static OutputBuffer<Object> full;

  private static OutputBuffer<Object> done;

  /**
   * Returns an {@code OutputBuffer} in the <em>full</em> state, that binds a
   * {@code null} result.
   */
  @SuppressWarnings("unchecked")
  public static <T> OutputBuffer<T> full() {
    if (full == null) {
      full = new OutputBufferFull<Object>(null, OutputSettings.standard());
    }
    return (OutputBuffer<T>) full;
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>full</em> state, with the given
   * {@code settings}.
   */
  public static <T> OutputBuffer<T> full(OutputSettings settings) {
    if (settings == OutputSettings.standard()) {
      return full();
    }
    return new OutputBufferFull<T>(null, settings);
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>full</em> state, that binds the
   * given {@code value}.
   */
  public static <T> OutputBuffer<T> full(T value) {
    if (value == null) {
      return full();
    }
    return new OutputBufferFull<T>(value, OutputSettings.standard());
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>full</em> state, that binds the
   * given {@code value}, with the given {@code settings}.
   */
  public static <T> OutputBuffer<T> full(T value, OutputSettings settings) {
    if (value == null && settings == OutputSettings.standard()) {
      return full();
    }
    return new OutputBufferFull<T>(value, settings);
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>done</em> state, that binds a
   * {@code null} result.
   */
  @SuppressWarnings("unchecked")
  public static <T> OutputBuffer<T> done() {
    if (done == null) {
      done = new OutputBufferDone<Object>(null, OutputSettings.standard());
    }
    return (OutputBuffer<T>) done;
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>done</em> state, with the given
   * {@code settings}.
   */
  public static <T> OutputBuffer<T> done(OutputSettings settings) {
    if (settings == OutputSettings.standard()) {
      return done();
    }
    return new OutputBufferDone<T>(null, settings);
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>done</em> state, that binds the
   * given {@code value}.
   */
  public static <T> OutputBuffer<T> done(T value) {
    if (value == null) {
      return done();
    }
    return new OutputBufferDone<T>(value, OutputSettings.standard());
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>done</em> state, that binds the
   * given {@code value}, with the given {@code settings}.
   */
  public static <T> OutputBuffer<T> done(T value, OutputSettings settings) {
    if (value == null && settings == OutputSettings.standard()) {
      return done();
    }
    return new OutputBufferDone<T>(value, settings);
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>error</em> state, with the
   * given output {@code error}.
   */
  public static <T> OutputBuffer<T> error(Throwable error) {
    return new OutputBufferError<T>(error, OutputSettings.standard());
  }

  /**
   * Returns an {@code OutputBuffer} in the <em>error</em> state, with the
   * given output {@code error} and {@code settings}.
   */
  public static <T> OutputBuffer<T> error(Throwable error, OutputSettings settings) {
    return new OutputBufferError<T>(error, settings);
  }
}

final class OutputBufferFull<T> extends OutputBuffer<T> {
  final T value;
  final OutputSettings settings;

  OutputBufferFull(T value, OutputSettings settings) {
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
  public OutputBuffer<T> isPart(boolean isPart) {
    if (isPart) {
      return OutputBuffer.done(this.value, this.settings);
    } else {
      return this;
    }
  }

  @Override
  public int index() {
    return 0;
  }

  @Override
  public OutputBuffer<T> index(int index) {
    if (index == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this.settings);
    }
  }

  @Override
  public int limit() {
    return 0;
  }

  @Override
  public OutputBuffer<T> limit(int limit) {
    if (limit == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid limit"), this.settings);
    }
  }

  @Override
  public int capacity() {
    return 0;
  }

  @Override
  public int remaining() {
    return 0;
  }

  @Override
  public byte[] array() {
    throw new UnsupportedOperationException();
  }

  @Override
  public int arrayOffset() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean has(int index) {
    return false;
  }

  @Override
  public int get(int index) {
    throw new OutputException();
  }

  @Override
  public void set(int index, int token) {
    throw new OutputException();
  }

  @Override
  public int write(ReadableByteChannel channel) throws IOException {
    return 0;
  }

  @Override
  public OutputBuffer<T> write(int token) {
    return OutputBuffer.error(new OutputException("full"), this.settings);
  }

  @Override
  public OutputBuffer<T> write(String string) {
    return OutputBuffer.error(new OutputException("full"), this.settings);
  }

  @Override
  public OutputBuffer<T> writeln(String string) {
    return OutputBuffer.error(new OutputException("full"), this.settings);
  }

  @Override
  public OutputBuffer<T> writeln() {
    return OutputBuffer.error(new OutputException("full"), this.settings);
  }

  @Override
  public OutputBuffer<T> move(int fromIndex, int toIndex, int length) {
    if (fromIndex == 0 && toIndex == 0 && length == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid move"), this.settings);
    }
  }

  @Override
  public OutputBuffer<T> step(int offset) {
    if (offset == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this.settings);
    }
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
  public OutputBuffer<T> settings(OutputSettings settings) {
    return OutputBuffer.full(this.value, settings);
  }

  @Override
  public OutputBuffer<T> clone() {
    return this;
  }
}

final class OutputBufferDone<T> extends OutputBuffer<T> {
  final T value;
  final OutputSettings settings;

  OutputBufferDone(T value, OutputSettings settings) {
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
  public OutputBuffer<T> isPart(boolean isPart) {
    if (isPart) {
      return this;
    } else {
      return OutputBuffer.full(this.value, this.settings);
    }
  }

  @Override
  public int index() {
    return 0;
  }

  @Override
  public OutputBuffer<T> index(int index) {
    if (index == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this.settings);
    }
  }

  @Override
  public int limit() {
    return 0;
  }

  @Override
  public OutputBuffer<T> limit(int limit) {
    if (limit == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid limit"), this.settings);
    }
  }

  @Override
  public int capacity() {
    return 0;
  }

  @Override
  public int remaining() {
    return 0;
  }

  @Override
  public byte[] array() {
    throw new UnsupportedOperationException();
  }

  @Override
  public int arrayOffset() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean has(int index) {
    return false;
  }

  @Override
  public int get(int index) {
    throw new OutputException();
  }

  @Override
  public void set(int index, int token) {
    throw new OutputException();
  }

  @Override
  public int write(ReadableByteChannel channel) throws IOException {
    return 0;
  }

  @Override
  public OutputBuffer<T> write(int token) {
    return OutputBuffer.error(new OutputException("done"), this.settings);
  }

  @Override
  public OutputBuffer<T> write(String string) {
    return OutputBuffer.error(new OutputException("done"), this.settings);
  }

  @Override
  public OutputBuffer<T> writeln(String string) {
    return OutputBuffer.error(new OutputException("done"), this.settings);
  }

  @Override
  public OutputBuffer<T> writeln() {
    return OutputBuffer.error(new OutputException("done"), this.settings);
  }

  @Override
  public OutputBuffer<T> move(int fromIndex, int toIndex, int length) {
    if (fromIndex == 0 && toIndex == 0 && length == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid move"), this.settings);
    }
  }

  @Override
  public OutputBuffer<T> step(int offset) {
    if (offset == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this.settings);
    }
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
  public OutputBuffer<T> settings(OutputSettings settings) {
    return OutputBuffer.done(this.value, settings);
  }

  @Override
  public OutputBuffer<T> clone() {
    return this;
  }
}

final class OutputBufferError<T> extends OutputBuffer<T> {
  final Throwable error;
  final OutputSettings settings;

  OutputBufferError(Throwable error, OutputSettings settings) {
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
  public OutputBuffer<T> isPart(boolean isPart) {
    return this;
  }

  @Override
  public int index() {
    return 0;
  }

  @Override
  public OutputBuffer<T> index(int index) {
    if (index == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this.settings);
    }
  }

  @Override
  public int limit() {
    return 0;
  }

  @Override
  public OutputBuffer<T> limit(int limit) {
    if (limit == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid limit"), this.settings);
    }
  }

  @Override
  public int capacity() {
    return 0;
  }

  @Override
  public int remaining() {
    return 0;
  }

  @Override
  public byte[] array() {
    throw new UnsupportedOperationException();
  }

  @Override
  public int arrayOffset() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean has(int index) {
    return false;
  }

  @Override
  public int get(int index) {
    throw new OutputException();
  }

  @Override
  public void set(int index, int token) {
    throw new OutputException();
  }

  @Override
  public int write(ReadableByteChannel channel) throws IOException {
    return 0;
  }

  @Override
  public OutputBuffer<T> write(int token) {
    return this;
  }

  @Override
  public OutputBuffer<T> write(String string) {
    return this;
  }

  @Override
  public OutputBuffer<T> writeln(String string) {
    return this;
  }

  @Override
  public OutputBuffer<T> writeln() {
    return this;
  }

  @Override
  public OutputBuffer<T> move(int fromIndex, int toIndex, int length) {
    if (fromIndex == 0 && toIndex == 0 && length == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid move"), this.settings);
    }
  }

  @Override
  public OutputBuffer<T> step(int offset) {
    if (offset == 0) {
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this.settings);
    }
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
  public OutputBuffer<T> settings(OutputSettings settings) {
    return OutputBuffer.error(this.error, settings);
  }

  @Override
  public OutputBuffer<T> clone() {
    return this;
  }
}
