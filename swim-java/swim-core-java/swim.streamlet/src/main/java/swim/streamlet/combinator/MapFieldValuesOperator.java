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

package swim.streamlet.combinator;

import java.util.Iterator;
import java.util.Map;
import swim.collections.HashTrieMap;
import swim.streamlet.AbstractMapInoutlet;
import swim.util.Cursor;

public abstract class MapFieldValuesOperator<K, VI, VO, I> extends AbstractMapInoutlet<K, VI, VO, I, Map<K, VO>> {
  @Override
  public boolean containsKey(K key) {
    if (this.input != null) {
      return this.input.containsKey(key);
    } else {
      return false;
    }
  }

  @Override
  public VO get(K key) {
    if (this.input != null) {
      return evaluate(key, this.input.get(key));
    } else {
      return null;
    }
  }

  @Override
  public Map<K, VO> get() {
    HashTrieMap<K, VO> output = HashTrieMap.empty();
    final Iterator<K> keys = keyIterator();
    while (keys.hasNext()) {
      final K key = keys.next();
      final VO value = evaluate(key, this.input.get(key));
      if (value != null) {
        output = output.updated(key, value);
      }
    }
    return output;
  }

  @Override
  public Iterator<K> keyIterator() {
    if (this.input != null) {
      return this.input.keyIterator();
    } else {
      return Cursor.empty();
    }
  }

  public abstract VO evaluate(K key, VI value);
}
