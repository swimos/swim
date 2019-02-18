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

import java.util.Iterator;
import swim.structure.Form;
import swim.structure.Value;

final class SpatialValueEntryIterator<K, S, V> implements Iterator<SpatialMap.Entry<K, S, V>> {
  final Iterator<SpatialMap.Entry<Value, S, Value>> inner;
  final Form<K> keyForm;
  final Form<V> valueForm;

  SpatialValueEntryIterator(Iterator<SpatialMap.Entry<Value, S, Value>> inner, Form<K> keyForm, Form<V> valueForm) {
    this.inner = inner;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
  }

  @Override
  public SpatialMap.Entry<K, S, V> next() {
    return new SpatialValueEntry<K, S, V>(this.inner.next(), this.keyForm, this.valueForm);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
