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

import java.util.Map;

final class CursorKeys<K> implements Cursor<K> {
  final Cursor<? extends Map.Entry<? extends K, ?>> inner;

  CursorKeys(Cursor<? extends Map.Entry<? extends K, ?>> inner) {
    this.inner = inner;
  }

  @Override
  public boolean isEmpty() {
    return this.inner.isEmpty();
  }

  @Override
  public K head() {
    return this.inner.head().getKey();
  }

  @Override
  public void step() {
    this.inner.step();
  }

  @Override
  public void skip(long count) {
    this.inner.skip(count);
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
  }

  @Override
  public long nextIndexLong() {
    return this.inner.nextIndexLong();
  }

  @Override
  public int nextIndex() {
    return this.inner.nextIndex();
  }

  @Override
  public K next() {
    return this.inner.next().getKey();
  }

  @Override
  public boolean hasPrevious() {
    return this.inner.hasPrevious();
  }

  @Override
  public long previousIndexLong() {
    return this.inner.previousIndexLong();
  }

  @Override
  public int previousIndex() {
    return this.inner.previousIndex();
  }

  @Override
  public K previous() {
    return this.inner.previous().getKey();
  }

  @Override
  public void load() throws InterruptedException {
    this.inner.load();
  }
}
