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

package swim.util;

import java.util.Iterator;
import java.util.NoSuchElementException;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class UnaryIterator<T> implements Iterator<T> {

  @Nullable T value;
  int index;

  public UnaryIterator(@Nullable T value) {
    this.value = value;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index == 0;
  }

  @Override
  public @Nullable T next() {
    if (this.index == 0) {
      final T value = this.value;
      this.value = null;
      return value;
    } else {
      throw new NoSuchElementException();
    }
  }

}
