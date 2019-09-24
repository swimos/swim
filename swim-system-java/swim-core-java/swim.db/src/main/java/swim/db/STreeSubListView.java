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

package swim.db;

import java.util.AbstractList;
import java.util.List;
import swim.structure.Value;

final class STreeSubListView extends AbstractList<Value> {
  final STreeListView inner;
  final int fromIndex;
  final int toIndex;

  STreeSubListView(STreeListView inner, int fromIndex, int toIndex) {
    this.inner = inner;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  @Override
  public int size() {
    return this.toIndex - this.fromIndex;
  }

  @Override
  public Value get(int index) {
    final int i = this.fromIndex + index;
    if (i < this.fromIndex || i >= this.toIndex) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.inner.get(i);
  }

  @Override
  public List<Value> subList(int fromIndex, int toIndex) {
    if (fromIndex > toIndex) {
      throw new IllegalArgumentException();
    }
    fromIndex += this.fromIndex;
    toIndex += this.fromIndex;
    if (toIndex > this.toIndex) {
      throw new IndexOutOfBoundsException();
    }
    return new STreeSubListView(this.inner, fromIndex, toIndex);
  }
}
