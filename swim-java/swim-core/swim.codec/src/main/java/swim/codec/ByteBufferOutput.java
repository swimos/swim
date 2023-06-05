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

import java.nio.ByteBuffer;
import swim.annotations.CheckReturnValue;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class ByteBufferOutput extends Output<ByteBuffer> {

  byte[] array;
  int size;
  boolean last;

  ByteBufferOutput(byte[] array, int size, boolean last) {
    this.array = array;
    this.size = size;
    this.last = last;
  }

  public ByteBufferOutput() {
    this(EMPTY_ARRAY, 0, true);
  }

  @Override
  public boolean isCont() {
    return true;
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
    return false;
  }

  @Override
  public boolean isLast() {
    return this.last;
  }

  @Override
  public ByteBufferOutput asLast(boolean last) {
    this.last = last;
    return this;
  }

  @Override
  public ByteBufferOutput write(int b) {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray;
    if (n + 1 > oldArray.length) {
      newArray = new byte[ByteBufferOutput.expand(n + 1)];
      System.arraycopy(oldArray, 0, newArray, 0, n);
      this.array = newArray;
    } else {
      newArray = oldArray;
    }
    newArray[n] = (byte) b;
    this.size = n + 1;
    return this;
  }

  @CheckReturnValue
  @Override
  public ByteBuffer get() {
    return ByteBuffer.wrap(this.array, 0, this.size);
  }

  @CheckReturnValue
  @Override
  public ByteBuffer getNonNull() {
    return this.get();
  }

  @CheckReturnValue
  @Override
  public ByteBuffer getUnchecked() {
    return this.get();
  }

  @CheckReturnValue
  @Override
  public ByteBuffer getNonNullUnchecked() {
    return this.get();
  }

  @Override
  public ByteBufferOutput clone() {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray = new byte[n];
    System.arraycopy(oldArray, 0, newArray, 0, n);
    return new ByteBufferOutput(newArray, n, this.last);
  }

  static final byte[] EMPTY_ARRAY = new byte[0];

  public static ByteBufferOutput ofCapacity(int capacity) {
    return new ByteBufferOutput(new byte[capacity], capacity, true);
  }

  static int expand(int n) {
    n = Math.max(32, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }

}
