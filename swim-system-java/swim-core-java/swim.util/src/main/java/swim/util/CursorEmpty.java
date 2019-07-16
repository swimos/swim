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

final class CursorEmpty<T> implements Cursor<T> {
  @Override
  public boolean isEmpty() {
    return true;
  }

  @Override
  public T head() {
    throw new NoSuchElementException();
  }

  @Override
  public void step() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void skip(long count) {
    // nop
  }

  @Override
  public boolean hasNext() {
    return false;
  }

  @Override
  public long nextIndexLong() {
    return 0L;
  }

  @Override
  public T next() {
    throw new NoSuchElementException();
  }

  @Override
  public boolean hasPrevious() {
    return false;
  }

  @Override
  public long previousIndexLong() {
    return -1L;
  }

  @Override
  public T previous() {
    throw new NoSuchElementException();
  }
}
