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

package swim.spatial;

import java.util.Comparator;

public abstract class QTreeContext<K, S, V> implements Comparator<QTreeEntry<K, S, V>> {
  @Override
  public int compare(QTreeEntry<K, S, V> x, QTreeEntry<K, S, V> y) {
    return compareKey(x.key, y.key);
  }

  @SuppressWarnings("unchecked")
  protected int compareKey(K x, K y) {
    return ((Comparable<Object>) x).compareTo(y);
  }

  protected int pageSplitSize() {
    return 32;
  }

  protected boolean pageShouldSplit(QTreePage<K, S, V> page) {
    return page.arity() > pageSplitSize();
  }

  protected boolean pageShouldMerge(QTreePage<K, S, V> page) {
    return page.arity() < pageSplitSize() >>> 1;
  }
}
