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

import java.lang.reflect.Array;
import java.util.Collection;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class ArrayBuilder<T, A> {

  final Class<?> componentClass;
  @Nullable A array;
  int length;

  public ArrayBuilder(Class<?> componentClass) {
    this.componentClass = componentClass;
    this.array = null;
    this.length = 0;
  }

  public boolean add(@Nullable T value) {
    A array = this.array;
    final int n = this.length;
    if (array == null || n + 1 > Array.getLength(array)) {
      final A newArray = Assume.conforms(Array.newInstance(this.componentClass, ArrayBuilder.expand(n + 1)));
      if (array != null) {
        System.arraycopy(array, 0, newArray, 0, n);
      }
      array = newArray;
      this.array = array;
    }
    Array.set(array, n, value);
    this.length = n + 1;
    return true;
  }

  public boolean addAll(Collection<? extends T> values) {
    final int k = values.size();
    if (k == 0) {
      return false;
    }
    A array = this.array;
    int n = this.length;
    if (array == null || n + k > Array.getLength(array)) {
      final A newArray = Assume.conforms(Array.newInstance(this.componentClass, ArrayBuilder.expand(n + k)));
      if (array != null) {
        System.arraycopy(array, 0, newArray, 0, n);
      }
      array = newArray;
      this.array = array;
    }
    for (T value : values) {
      Array.set(array, n, value);
      n += 1;
    }
    this.length = n;
    return true;
  }

  public A build() {
    A array = this.array;
    final int n = this.length;
    if (array == null || n != Array.getLength(array)) {
      final A newArray = Assume.conforms(Array.newInstance(this.componentClass, n));
      if (array != null) {
        System.arraycopy(array, 0, newArray, 0, n);
      }
      array = newArray;
      this.array = array;
    }
    return array;
  }

  static int expand(int n) {
    n = Math.max(8, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }

}
