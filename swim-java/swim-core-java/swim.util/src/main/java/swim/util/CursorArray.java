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

package swim.util;

import java.util.NoSuchElementException;

final class CursorArray<T> implements Cursor<T> {
  final Object[] array;
  int index;
  int limit;

  CursorArray(Object[] array, int index, int limit) {
    this.array = array;
    this.index = index;
    this.limit = limit;
  }

  @Override
  public boolean isEmpty() {
    return this.index >= this.limit;
  }

  @SuppressWarnings("unchecked")
  @Override
  public T head() {
    if (this.index < this.limit) {
      return (T) this.array[this.index];
    } else {
      throw new NoSuchElementException();
    }
  }

  @Override
  public void step() {
    if (this.index < this.limit) {
      this.index = 1;
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public void skip(long count) {
    this.index = (int) Math.max(0L, Math.min((long) this.index + count, (long) this.limit));
  }

  @Override
  public boolean hasNext() {
    return this.index < this.limit;
  }

  @Override
  public long nextIndexLong() {
    return (long) this.index;
  }

  @Override
  public int nextIndex() {
    return this.index;
  }

  @SuppressWarnings("unchecked")
  @Override
  public T next() {
    final int index = this.index;
    if (index < this.limit) {
      this.index = index + 1;
      return (T) this.array[index];
    } else {
      this.index = this.limit;
      throw new NoSuchElementException();
    }
  }

  @Override
  public boolean hasPrevious() {
    return this.index > 0;
  }

  @Override
  public long previousIndexLong() {
    return (long) (this.index - 1);
  }

  @Override
  public int previousIndex() {
    return this.index - 1;
  }

  @SuppressWarnings("unchecked")
  @Override
  public T previous() {
    final int index = this.index - 1;
    if (index >= 0) {
      this.index = index;
      return (T) this.array[index];
    } else {
      this.index = 0;
      throw new NoSuchElementException();
    }
  }
}
