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

import java.util.Map;

public class QTreeEntry<K, S, V> implements SpatialMap.Entry<K, S, V> {
  final K key;
  final S shape;
  final long x;
  final long y;
  final V value;

  public QTreeEntry(K key, S shape, long x, long y, V value) {
    this.key = key;
    this.shape = shape;
    this.x = x;
    this.y = y;
    this.value = value;
  }

  @Override
  public final K getKey() {
    return this.key;
  }

  @Override
  public final S getShape() {
    return this.shape;
  }

  public final long x() {
    return this.x;
  }

  public final int xRank() {
    return Long.numberOfLeadingZeros(~this.x);
  }

  public final long xBase() {
    return this.x << xRank();
  }

  public final long y() {
    return this.y;
  }

  public final int yRank() {
    return Long.numberOfLeadingZeros(~this.y);
  }

  public final long yBase() {
    return this.y << yRank();
  }

  @Override
  public final V getValue() {
    return this.value;
  }

  @Override
  public V setValue(V newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map.Entry<?, ?>) {
      final Map.Entry<?, ?> that = (Map.Entry<?, ?>) other;
      if (this.key == null ? that.getKey() != null : !this.key.equals(that.getKey())) {
        return false;
      }
      if (this.value == null ? that.getValue() != null : !this.value.equals(that.getValue())) {
        return false;
      }
      return true;
    }
    return false;
  }

  @Override
  public int hashCode() {
    return (this.key == null ? 0 : this.key.hashCode())
         ^ (this.value == null ? 0 : this.value.hashCode());
  }

  @Override
  public String toString() {
    return new StringBuilder().append(this.key).append('=').append(this.value).toString();
  }
}
