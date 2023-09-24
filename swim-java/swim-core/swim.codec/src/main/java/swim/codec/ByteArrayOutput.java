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

import swim.annotations.CheckReturnValue;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class ByteArrayOutput extends Output<byte[]> {

  byte[] array;
  int size;
  boolean last;

  ByteArrayOutput(byte[] array, int size, boolean last) {
    this.array = array;
    this.size = size;
    this.last = last;
  }

  public ByteArrayOutput() {
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
  public ByteArrayOutput asLast(boolean last) {
    this.last = last;
    return this;
  }

  @Override
  public ByteArrayOutput write(int b) {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray;
    if (n + 1 > oldArray.length) {
      newArray = new byte[ByteArrayOutput.expand(n + 1)];
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
  public byte[] get() {
    final int n = this.size;
    final byte[] oldArray = this.array;
    if (n == oldArray.length) {
      return oldArray;
    } else {
      final byte[] newArray = new byte[n];
      System.arraycopy(oldArray, 0, newArray, 0, n);
      this.array = newArray;
      return newArray;
    }
  }

  @CheckReturnValue
  @Override
  public byte[] getNonNull() {
    return this.get();
  }

  @CheckReturnValue
  @Override
  public byte[] getUnchecked() {
    return this.get();
  }

  @CheckReturnValue
  @Override
  public byte[] getNonNullUnchecked() {
    return this.get();
  }

  @Override
  public ByteArrayOutput clone() {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray = new byte[n];
    System.arraycopy(oldArray, 0, newArray, 0, n);
    return new ByteArrayOutput(newArray, n, this.last);
  }

  static final byte[] EMPTY_ARRAY = new byte[0];

  public static ByteArrayOutput ofCapacity(int capacity) {
    return new ByteArrayOutput(new byte[capacity], capacity, true);
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
