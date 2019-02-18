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

package swim.structure.collections;

import java.util.AbstractSet;
import java.util.Iterator;
import java.util.Map;
import swim.structure.Form;
import swim.structure.Value;

public class ValueMapEntrySet<K, V> extends AbstractSet<Map.Entry<K, V>> {
  protected Map<Value, Value> inner;
  protected Form<K> keyForm;
  protected Form<V> valueForm;

  @SuppressWarnings("unchecked")
  public ValueMapEntrySet(Map<? extends Value, ? extends Value> inner, Form<K> keyForm, Form<V> valueForm) {
    this.inner = (Map<Value, Value>) inner;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
  }

  @Override
  public int size() {
    return this.inner.size();
  }

  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    return new ValueEntryIterator<K, V>(this.inner.entrySet().iterator(), this.keyForm, this.valueForm);
  }
}
