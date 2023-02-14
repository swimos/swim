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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Non-blocking token stream buffer.
 */
@Public
@Since("5.0")
public abstract class InputBuffer extends Input {

  protected InputBuffer() {
    // nop
  }

  @Override
  public abstract InputBuffer asLast(boolean last);

  public abstract int index();

  /**
   * Repositions the buffer to the given {@code index} and returns {@code this}.
   *
   * @throws IndexOutOfBoundsException if {@code index} is not between
   *         zero and the buffer {@linkplain #limit() limit}, inclusive.
   */
  public abstract InputBuffer index(int index);

  public abstract int limit();

  /**
   * Sets the endpoint of the buffer to the given {@code limit} and returns {@code this}.
   *
   * @throws IndexOutOfBoundsException if {@code limit} is not between
   *         zero and the buffer {@linkplain #capacity() capacity}, inclusive.
   */
  public abstract InputBuffer limit(int limit);

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
  public abstract InputBuffer step();

  /**
   * Advances the buffer position by {@code offset} tokens and returns {@code this}.
   *
   * @throws IllegalStateException if the updated position is not between
   *         zero and the buffer {@linkplain #limit() limit}, inclusive.
   */
  public abstract InputBuffer step(int offset);

  @Override
  public abstract InputBuffer seek(@Nullable SourcePosition position);

  @Override
  public abstract InputBuffer withIdentifier(@Nullable String identifier);

  @Override
  public abstract InputBuffer withPosition(SourcePosition position);

  @Override
  public abstract InputBuffer clone();

}
