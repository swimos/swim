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

import java.nio.ByteBuffer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A non-blocking chunked input buffer.
 */
@Public
@Since("5.0")
public abstract class InputBuffer extends Input {

  protected InputBuffer() {
    // nop
  }

  @Override
  public abstract InputBuffer asLast(boolean last);

  /**
   * Returns the position in the buffer of the current lookahead token.
   */
  public abstract int position();

  /**
   * Repositions the buffer to the given {@code position} and returns {@code this}.
   *
   * @throws IllegalArgumentException if {@code position} is not between
   *         zero and the buffer {@linkplain #limit() limit}, inclusive.
   */
  public abstract InputBuffer position(int position);

  public abstract int limit();

  /**
   * Sets the endpoint of the buffer to the given {@code limit} and returns {@code this}.
   *
   * @throws IllegalArgumentException if {@code limit} is not between
   *         zero and the buffer {@linkplain #capacity() capacity}, inclusive.
   */
  public abstract InputBuffer limit(int limit);

  public abstract int capacity();

  public abstract boolean hasRemaining();

  public abstract int remaining();

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
  public abstract InputBuffer step();

  /**
   * Advances the buffer position by {@code offset} tokens and returns {@code this}.
   *
   * @throws IllegalArgumentException if the updated position is not between
   *         zero and the buffer {@linkplain #limit() limit}, inclusive.
   */
  public abstract InputBuffer step(int offset);

  @Override
  public abstract InputBuffer seek(@Nullable SourcePosition position);

  public abstract InputBuffer flip();

  public abstract InputBuffer rewind();

  public abstract InputBuffer compact();

  public abstract InputBuffer clear();

  /**
   * Copies {@code length} bytes starting at position {@code fromIndex}
   * to position {@code toIndex}
   *
   * @throws IndexOutOfBoundsException if any source or destination position
   *         is not between zero and the buffer {@linkplain #limit() limit}.
   */
  public abstract InputBuffer shift(int fromIndex, int toIndex, int length);

  @Override
  public abstract InputBuffer location(SourcePosition location);

  @Override
  public abstract InputBuffer name(@Nullable String name);

  public abstract boolean hasArray();

  public abstract byte[] array();

  public abstract int arrayOffset();

  public abstract boolean hasByteBuffer();

  public abstract ByteBuffer byteBuffer();

  public abstract ByteBuffer asByteBuffer();

  @Override
  public abstract InputBuffer clone();

}
