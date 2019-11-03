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

package swim.avro.reflection;

import java.lang.reflect.Array;
import java.util.Collection;
import swim.avro.schema.AvroArrayType;
import swim.avro.schema.AvroType;
import swim.util.Builder;

final class ArrayReflection<I> extends AvroArrayType<I, Object> {
  final Class<?> itemClass;
  final AvroType<I> itemType;

  ArrayReflection(Class<?> itemClass, AvroType<I> itemType) {
    this.itemClass = itemClass;
    this.itemType = itemType;
  }

  @Override
  public AvroType<I> itemType() {
    return this.itemType;
  }

  @Override
  public Builder<I, Object> arrayBuilder() {
    return new ArrayReflectionBuilder<I>(this.itemClass);
  }
}

final class ArrayReflectionBuilder<I> implements Builder<I, Object> {
  final Class<?> itemClass;
  Object array;
  int length;

  ArrayReflectionBuilder(Class<?> itemClass) {
    this.itemClass = itemClass;
    this.array = null;
    this.length = 0;
  }

  @Override
  public boolean add(I newItem) {
    final Object oldArray = this.array;
    final Object newArray;
    final int n = this.length;
    if (oldArray == null || n + 1 > Array.getLength(oldArray)) {
      newArray = Array.newInstance(this.itemClass, expand(n + 1));
      if (oldArray != null) {
        System.arraycopy(oldArray, 0, newArray, 0, n);
      }
      this.array = newArray;
    } else {
      newArray = oldArray;
    }
    Array.set(newArray, n, newItem);
    this.length = n + 1;
    return true;
  }

  @Override
  public boolean addAll(Collection<? extends I> newItems) {
    final int k = newItems.size();
    if (k == 0) {
      return false;
    }
    int n = this.length;
    final Object oldArray = this.array;
    final Object newArray;
    if (oldArray == null || n + k > Array.getLength(oldArray)) {
      newArray = Array.newInstance(this.itemClass, expand(n + k));
      if (oldArray != null) {
        System.arraycopy(oldArray, 0, newArray, 0, n);
      }
    } else {
      newArray = oldArray;
    }
    for (Object newItem : newItems) {
      Array.set(newArray, n, newItem);
      n += 1;
    }
    this.array = newArray;
    this.length = n;
    return true;
  }

  @Override
  public Object bind() {
    Object array = this.array;
    if (array != null) {
      final int length = this.length;
      if (length != Array.getLength(array)) {
        array = Array.newInstance(this.itemClass, length);
        System.arraycopy(this.array, 0, array, 0, length);
      }
      this.array = null;
    } else {
      array = Array.newInstance(this.itemClass, 0);
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
