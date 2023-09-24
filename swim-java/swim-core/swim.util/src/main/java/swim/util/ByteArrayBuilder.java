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

package swim.util;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class ByteArrayBuilder {

  byte @Nullable [] array;
  int length;

  public ByteArrayBuilder() {
    this.array = null;
    this.length = 0;
  }

  public boolean add(byte value) {
    byte[] array = this.array;
    final int n = this.length;
    if (array == null || n + 1 > array.length) {
      final byte[] newArray = new byte[ByteArrayBuilder.expand(n + 1)];
      if (array != null) {
        System.arraycopy(array, 0, newArray, 0, n);
      }
      array = newArray;
      this.array = array;
    }
    array[n] = value;
    this.length = n + 1;
    return true;
  }

  public boolean addArray(byte[] values) {
    final int k = values.length;
    if (k == 0) {
      return false;
    }
    byte[] array = this.array;
    final int n = this.length;
    if (array == null || n + k > array.length) {
      final byte[] newArray = new byte[ByteArrayBuilder.expand(n + k)];
      if (array != null) {
        System.arraycopy(array, 0, newArray, 0, n);
      }
      array = newArray;
      this.array = array;
    }
    System.arraycopy(values, 0, array, n, k);
    this.length = n + k;
    return true;
  }

  public byte[] build() {
    byte[] array = this.array;
    final int n = this.length;
    if (array == null || n != array.length) {
      final byte[] newArray = new byte[n];
      if (array != null) {
        System.arraycopy(array, 0, newArray, 0, n);
      }
      array = newArray;
      this.array = array;
    }
    return array;
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
