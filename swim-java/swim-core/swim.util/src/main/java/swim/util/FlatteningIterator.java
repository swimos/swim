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
public abstract class FlatteningIterator<P, T> implements Iterator<T> {

  @Nullable Iterator<P> outer;
  @Nullable Iterator<T> inner;

  protected FlatteningIterator(Iterator<P> outer) {
    this.outer = outer;
    this.inner = null;
  }

  protected abstract Iterator<T> childIterator(P parent);

  @Override
  public boolean hasNext() {
    while (true) {
      if (this.inner != null && this.inner.hasNext()) {
        return true;
      } else if (this.outer != null && this.outer.hasNext()) {
        this.inner = this.childIterator(this.outer.next());
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
        this.inner = this.childIterator(this.outer.next());
      } else {
        this.inner = null;
        this.outer = null;
        throw new NoSuchElementException();
      }
    }
  }

}
