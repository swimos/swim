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

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Non-blocking token stream buffer.
 */
@Public
@Since("5.0")
public abstract class OutputBuffer<T> extends Output<T> {

  protected OutputBuffer() {
    // nop
  }

  @Override
  public abstract OutputBuffer<T> asLast(boolean last);

  public abstract int index();

  /**
   * Repositions the buffer to the given {@code index} and returns {@code this}.
   *
   * @throws IndexOutOfBoundsException if {@code index} is not between
   *         zero and the buffer {@linkplain #limit() limit}, inclusive.
   */
  public abstract OutputBuffer<T> index(int index);

  public abstract int limit();

  /**
   * Sets the endpoint of the buffer to the given {@code limit} and returns {@code this}.
   *
   * @throws IndexOutOfBoundsException if {@code limit} is not between
   *         zero and the buffer {@linkplain #capacity() capacity}, inclusive.
   */
  public abstract OutputBuffer<T> limit(int limit);

  public abstract int capacity();

  public abstract int remaining();

  public abstract byte[] array();

  public abstract int arrayOffset();

  public abstract boolean has(int index);

  /**
   * Returns the value at the given buffer {@code index}.
   *
   * @throws IndexOutOfBoundsException if {@code index} is not between
   *         zero and the buffer {@linkplain #limit() limit}, exclusive.
   */
  public abstract int get(int index);

  /**
   * Sets the value at the given buffer {@code index} to {@code token}.
   *
   * @throws IndexOutOfBoundsException if {@code index} is not between
   *         zero and the buffer {@linkplain #limit() limit}, exclusive.
   */
  public abstract void set(int index, int token);

  @Override
  public abstract OutputBuffer<T> write(int token);

  public abstract OutputBuffer<T> write(ByteBuffer buffer);

  public abstract int write(ReadableByteChannel channel) throws IOException;

  /**
   * Copies {@code length} bytes starting at position {@code fromIndex} to
   * position {@code toIndex}
   *
   * @throws IndexOutOfBoundsException if any source or destination position is
   *         not between zero and the buffer {@linkplain #limit() limit}, exclusive.
   */
  public abstract OutputBuffer<T> move(int fromIndex, int toIndex, int length);

  /**
   * Advances the buffer position by {@code offset} tokens and returns {@code this}.
   *
   * @throws IllegalStateException if the updated position is not between
   *         zero and the buffer {@linkplain #limit() limit}, inclusive.
   */
  public abstract OutputBuffer<T> step(int offset);

  @Override
  public OutputBuffer<T> clone() {
    throw new UnsupportedOperationException();
  }

}
