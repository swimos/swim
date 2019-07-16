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
 * Non-blocking token stream buffer.
 */
public abstract class InputBuffer extends Input {
  @Override
  public abstract InputBuffer isPart(boolean isPart);

  public abstract int index();

  public abstract InputBuffer index(int index);

  public abstract int limit();

  public abstract InputBuffer limit(int limit);

  public abstract int capacity();

  public abstract int remaining();

  public abstract byte[] array();

  public abstract int arrayOffset();

  public abstract boolean has(int index);

  public abstract int get(int index);

  public abstract void set(int index, int token);

  @Override
  public abstract InputBuffer step();

  public abstract InputBuffer step(int offset);

  @Override
  public abstract InputBuffer seek(Mark mark);

  @Override
  public InputBuffer fork(Object condition) {
    return this;
  }

  @Override
  public abstract InputBuffer id(Object id);

  @Override
  public abstract InputBuffer mark(Mark mark);

  @Override
  public abstract InputBuffer settings(InputSettings settings);

  @Override
  public abstract InputBuffer clone();

  private static InputBuffer empty;

  private static InputBuffer done;

  /**
   * Returns an {@code InputBuffer} in the <em>empty</em> state.
   */
  public static InputBuffer empty() {
    if (empty == null) {
      empty = new InputBufferEmpty(null, Mark.zero(), InputSettings.standard());
    }
    return empty;
  }

  /**
   * Returns an {@code InputBuffer} in the <em>empty</em> state, with the given
   * {@code settings}.
   */
  public static InputBuffer empty(InputSettings settings) {
    if (settings == InputSettings.standard()) {
      return empty();
    }
    return new InputBufferEmpty(null, Mark.zero(), settings);
  }

  /**
   * Returns an {@code InputBuffer} in the <em>empty</em> state, at the {@code
   * mark} position of a token stream logically identified by {@code id}.
   */
  public static InputBuffer empty(Object id, Mark mark) {
    if (id == null && (mark == null || mark == Mark.zero())) {
      return empty();
    }
    return new InputBufferEmpty(id, mark, InputSettings.standard());
  }

  /**
   * Returns an {@code InputBuffer} in the <em>empty</em> state, at the {@code
   * mark} position of a token stream logically identified by {@code id},
   * with the given {@code settings}.
   */
  public static InputBuffer empty(Object id, Mark mark, InputSettings settings) {
    if (id == null && (mark == null || mark == Mark.zero()) && settings == InputSettings.standard()) {
      return empty();
    }
    return new InputBufferEmpty(id, mark, settings);
  }

  /**
   * Returns an {@code InputBuffer} in the <em>done</em> state.
   */
  public static InputBuffer done() {
    if (done == null) {
      done = new InputBufferDone(null, Mark.zero(), InputSettings.standard());
    }
    return done;
  }

  /**
   * Returns an {@code InputBuffer} in the <em>done</em> state, with the given
   * {@code settings}.
   */
  public static InputBuffer done(InputSettings settings) {
    if (settings == InputSettings.standard()) {
      return done();
    }
    return new InputBufferDone(null, Mark.zero(), settings);
  }

  /**
   * Returns an {@code InputBuffer} in the <em>done</em> state, at the {@code
   * mark} position of a token stream logically identified by {@code id}.
   */
  public static InputBuffer done(Object id, Mark mark) {
    if (id == null && (mark == null || mark == Mark.zero())) {
      return done();
    }
    return new InputBufferDone(id, mark, InputSettings.standard());
  }

  /**
   * Returns an {@code InputBuffer} in the <em>done</em> state, at the {@code
   * mark} position of a token stream logically identified by {@code id},
   * with the given {@code settings}.
   */
  public static InputBuffer done(Object id, Mark mark, InputSettings settings) {
    if (id == null && (mark == null || mark == Mark.zero()) && settings == InputSettings.standard()) {
      return done();
    }
    return new InputBufferDone(id, mark, settings);
  }

  /**
   * Returns an {@code InputBuffer} in the <em>error</em> state, with the given
   * input {@code error}.
   */
  public static InputBuffer error(Throwable error) {
    return new InputBufferError(error, null, Mark.zero(), InputSettings.standard());
  }

  /**
   * Returns an {@code InputBuffer} in the <em>error</em> state, with the given
   * input {@code error} and {@code settings}.
   */
  public static InputBuffer error(Throwable error, InputSettings settings) {
    return new InputBufferError(error, null, Mark.zero(), settings);
  }

  /**
   * Returns an {@code InputBuffer} in the <em>error</em> state, with the given
   * input {@code error}, at the {@code mark} position of a token stream
   * logically identified by {@code id}.
   */
  public static InputBuffer error(Throwable error, Object id, Mark mark) {
    return new InputBufferError(error, id, mark, InputSettings.standard());
  }

  /**
   * Returns an {@code InputBuffer} in the <em>error</em> state, with the given
   * input {@code error}, at the {@code mark} position of a token stream
   * logically identified by {@code id}, with the given {@code settings}.
   */
  public static InputBuffer error(Throwable error, Object id, Mark mark, InputSettings settings) {
    return new InputBufferError(error, id, mark, settings);
  }
}

final class InputBufferEmpty extends InputBuffer {
  final Object id;
  final Mark mark;
  final InputSettings settings;

  InputBufferEmpty(Object id, Mark mark, InputSettings settings) {
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
  public InputBuffer isPart(boolean isPart) {
    if (isPart) {
      return this;
    } else {
      return InputBuffer.done(this.id, this.mark, this.settings);
    }
  }

  @Override
  public int index() {
    return 0;
  }

  @Override
  public InputBuffer index(int index) {
    if (index == 0) {
      return this;
    } else {
      final Throwable error = new InputException("invalid index");
      return InputBuffer.error(error, this.id, this.mark, this.settings);
    }
  }

  @Override
  public int limit() {
    return 0;
  }

  @Override
  public InputBuffer limit(int limit) {
    if (limit == 0) {
      return this;
    } else {
      final Throwable error = new InputException("invalid limit");
      return InputBuffer.error(error, this.id, this.mark, this.settings);
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
    throw new InputException();
  }

  @Override
  public void set(int index, int token) {
    throw new InputException();
  }

  @Override
  public int head() {
    throw new InputException();
  }

  @Override
  public InputBuffer step() {
    final Throwable error = new InputException("empty step");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public InputBuffer step(int offset) {
    final Throwable error = new InputException("empty step");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public InputBuffer fork(Object condition) {
    if (condition instanceof InputBuffer) {
      return (InputBuffer) condition;
    }
    return this;
  }

  @Override
  public InputBuffer seek(Mark mark) {
    final Throwable error = new InputException("empty seek");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Object id() {
    return this.id;
  }

  @Override
  public InputBuffer id(Object id) {
    return InputBuffer.empty(id, this.mark, this.settings);
  }

  @Override
  public Mark mark() {
    return this.mark;
  }

  @Override
  public InputBuffer mark(Mark mark) {
    return InputBuffer.empty(this.id, mark, this.settings);
  }

  @Override
  public InputSettings settings() {
    return this.settings;
  }

  @Override
  public InputBuffer settings(InputSettings settings) {
    return InputBuffer.empty(this.id, this.mark, settings);
  }

  @Override
  public InputBuffer clone() {
    return this;
  }
}

final class InputBufferDone extends InputBuffer {
  final Object id;
  final Mark mark;
  final InputSettings settings;

  InputBufferDone(Object id, Mark mark, InputSettings settings) {
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
  public InputBuffer isPart(boolean isPart) {
    if (isPart) {
      return InputBuffer.empty(this.id, this.mark, this.settings);
    } else {
      return this;
    }
  }

  @Override
  public int index() {
    return 0;
  }

  @Override
  public InputBuffer index(int index) {
    if (index == 0) {
      return this;
    } else {
      final Throwable error = new InputException("invalid index");
      return InputBuffer.error(error, this.id, this.mark, this.settings);
    }
  }

  @Override
  public int limit() {
    return 0;
  }

  @Override
  public InputBuffer limit(int limit) {
    if (limit == 0) {
      return this;
    } else {
      final Throwable error = new InputException("invalid limit");
      return InputBuffer.error(error, this.id, this.mark, this.settings);
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
    throw new InputException();
  }

  @Override
  public void set(int index, int token) {
    throw new InputException();
  }

  @Override
  public int head() {
    throw new InputException();
  }

  @Override
  public InputBuffer step() {
    final Throwable error = new InputException("done step");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public InputBuffer step(int offset) {
    final Throwable error = new InputException("done step");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public InputBuffer seek(Mark mark) {
    final Throwable error = new InputException("empty seek");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Object id() {
    return this.id;
  }

  @Override
  public InputBuffer id(Object id) {
    return InputBuffer.done(id, this.mark, this.settings);
  }

  @Override
  public Mark mark() {
    return this.mark;
  }

  @Override
  public InputBuffer mark(Mark mark) {
    return InputBuffer.done(this.id, mark, this.settings);
  }

  @Override
  public InputSettings settings() {
    return this.settings;
  }

  @Override
  public InputBuffer settings(InputSettings settings) {
    return InputBuffer.done(this.id, this.mark, settings);
  }

  @Override
  public InputBuffer clone() {
    return this;
  }
}

final class InputBufferError extends InputBuffer {
  final Throwable error;
  final Object id;
  final Mark mark;
  final InputSettings settings;

  InputBufferError(Throwable error, Object id, Mark mark, InputSettings settings) {
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
  public InputBuffer isPart(boolean isPart) {
    return this;
  }

  @Override
  public int index() {
    return 0;
  }

  @Override
  public InputBuffer index(int index) {
    if (index == 0) {
      return this;
    } else {
      final Throwable error = new InputException("invalid index");
      return InputBuffer.error(error, this.id, this.mark, this.settings);
    }
  }

  @Override
  public int limit() {
    return 0;
  }

  @Override
  public InputBuffer limit(int limit) {
    if (limit == 0) {
      return this;
    } else {
      final Throwable error = new InputException("invalid limit");
      return InputBuffer.error(error, this.id, this.mark, this.settings);
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
    throw new InputException();
  }

  @Override
  public void set(int index, int token) {
    throw new InputException();
  }

  @Override
  public int head() {
    throw new InputException();
  }

  @Override
  public InputBuffer step() {
    final Throwable error = new InputException("error step");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public InputBuffer step(int offset) {
    final Throwable error = new InputException("error step");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Throwable trap() {
    return this.error;
  }

  @Override
  public InputBuffer seek(Mark mark) {
    final Throwable error = new InputException("empty seek");
    return InputBuffer.error(error, this.id, this.mark, this.settings);
  }

  @Override
  public Object id() {
    return this.id;
  }

  @Override
  public InputBuffer id(Object id) {
    return InputBuffer.error(this.error, id, this.mark, this.settings);
  }

  @Override
  public Mark mark() {
    return this.mark;
  }

  @Override
  public InputBuffer mark(Mark mark) {
    return InputBuffer.error(this.error, this.id, mark, this.settings);
  }

  @Override
  public InputSettings settings() {
    return this.settings;
  }

  @Override
  public InputBuffer settings(InputSettings settings) {
    return InputBuffer.error(this.error, this.id, this.mark, settings);
  }

  @Override
  public InputBuffer clone() {
    return this;
  }
}
