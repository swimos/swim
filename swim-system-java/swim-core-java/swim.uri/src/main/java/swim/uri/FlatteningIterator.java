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

package swim.uri;

import java.util.Iterator;
import java.util.NoSuchElementException;

abstract class FlatteningIterator<P, T> implements Iterator<T> {
  Iterator<P> outer;
  Iterator<T> inner;

  FlatteningIterator(Iterator<P> outer) {
    this.outer = outer;
  }

  protected abstract Iterator<T> childIterator(P parent);

  public boolean hasNext() {
    while (true) {
      if (this.inner != null && this.inner.hasNext()) {
        return true;
      } else if (this.outer != null && this.outer.hasNext()) {
        this.inner = childIterator(this.outer.next());
      } else {
        this.inner = null;
        this.outer = null;
        return false;
      }
    }
  }

  @Override
  public T next() {
    while (true) {
      if (this.inner != null && this.inner.hasNext()) {
        return this.inner.next();
      } else if (this.outer != null && this.outer.hasNext()) {
        this.inner = childIterator(this.outer.next());
      } else {
        this.inner = null;
        this.outer = null;
        throw new NoSuchElementException();
      }
    }
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
