// Copyright 2015-2023 Nstream, inc.
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

package swim.structure.form.classes;

import java.util.Map;
import swim.util.Murmur3;

@SuppressWarnings("checkstyle:VisibilityModifier")
public class GenericMap<K, V> {

  public Map<K, V> map;

  public GenericMap(Map<K, V> map) {
    this.map = map;
  }

  public GenericMap() {
    // Form.cast constructor
  }

  @Override
  public boolean equals(Object other) {
    if (other instanceof GenericMap<?, ?>) {
      final GenericMap<?, ?> that = (GenericMap<?, ?>) other;
      return this.map == null ? that.map == null : this.map.equals(that.map);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.hash(this.map);
  }

  @Override
  public String toString() {
    return "GenericMap(" + this.map + ")";
  }

}
