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

import java.nio.ByteBuffer;

abstract class ByteOutput<T> extends Output<T> {
  byte[] array;
  int size;
  OutputSettings settings;

  ByteOutput(byte[] array, int size, OutputSettings settings) {
    this.array = array;
    this.size = size;
    this.settings = settings;
  }

  @Override
  public final boolean isCont() {
    return true;
  }

  @Override
  public final boolean isFull() {
    return false;
  }

  @Override
  public final boolean isDone() {
    return false;
  }

  @Override
  public final boolean isError() {
    return false;
  }

  @Override
  public final boolean isPart() {
    return false;
  }

  @Override
  public final Output<T> isPart(boolean isPart) {
    return this;
  }

  @Override
  public final Output<T> write(int b) {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray;
    if (oldArray == null || n + 1 > oldArray.length) {
      newArray = new byte[expand(n + 1)];
      if (oldArray != null) {
        System.arraycopy(oldArray, 0, newArray, 0, n);
      }
      this.array = newArray;
    } else {
      newArray = oldArray;
    }
    newArray[n] = (byte) b;
    this.size = n + 1;
    return this;
  }

  @Override
  public Output<T> write(String string) {
    throw new UnsupportedOperationException("binary output");
  }

  @Override
  public Output<T> writeln(String string) {
    throw new UnsupportedOperationException("binary output");
  }

  @Override
  public Output<T> writeln() {
    throw new UnsupportedOperationException("binary output");
  }

  final byte[] toByteArray() {
    final int n = this.size;
    final byte[] oldArray = this.array;
    if (oldArray != null && n == oldArray.length) {
      return oldArray;
    } else {
      final byte[] newArray = new byte[n];
      if (oldArray != null) {
        System.arraycopy(oldArray, 0, newArray, 0, n);
      }
      this.array = newArray;
      return newArray;
    }
  }

  final ByteBuffer toByteBuffer() {
    return ByteBuffer.wrap(this.array != null ? this.array : new byte[0], 0, this.size);
  }

  final byte[] cloneArray() {
    final byte[] oldArray = this.array;
    if (oldArray != null) {
      final int n = this.size;
      final byte[] newArray = new byte[n];
      System.arraycopy(oldArray, 0, newArray, 0, n);
      return newArray;
    } else {
      return null;
    }
  }

  @Override
  public OutputSettings settings() {
    return this.settings;
  }

  @Override
  public Output<T> settings(OutputSettings settings) {
    this.settings = settings;
    return this;
  }

  static int expand(int n) {
    n = Math.max(32, n) - 1;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
  }
}
