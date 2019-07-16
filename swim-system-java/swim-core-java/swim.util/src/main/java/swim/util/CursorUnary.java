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

final class CursorUnary<T> implements Cursor<T> {
  final T value;
  int index;

  CursorUnary(T value) {
    this.value = value;
    this.index = 0;
  }

  @Override
  public boolean isEmpty() {
    return this.index != 0;
  }

  @Override
  public T head() {
    if (this.index == 0) {
      return this.value;
    } else {
      throw new NoSuchElementException();
    }
  }

  @Override
  public void step() {
    if (this.index == 0) {
      this.index = 1;
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public void skip(long count) {
    this.index = (int) Math.min(Math.max(0L, (long) this.index + count), 1L);
  }

  @Override
  public boolean hasNext() {
    return this.index == 0;
  }

  @Override
  public long nextIndexLong() {
    return (long) this.index;
  }

  @Override
  public int nextIndex() {
    return this.index;
  }

  @Override
  public T next() {
    if (this.index == 0) {
      this.index = 1;
      return this.value;
    } else {
      throw new NoSuchElementException();
    }
  }

  @Override
  public boolean hasPrevious() {
    return this.index == 1;
  }

  @Override
  public long previousIndexLong() {
    return (long) (this.index - 1);
  }

  @Override
  public int previousIndex() {
    return this.index - 1;
  }

  @Override
  public T previous() {
    if (this.index == 1) {
      this.index = 0;
      return this.value;
    } else {
      throw new NoSuchElementException();
    }
  }
}
