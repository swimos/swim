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

import java.util.Map;

final class UriQueryEntry implements Map.Entry<String, String> {
  final String key;
  final String value;

  UriQueryEntry(String key, String value) {
    this.key = key;
    this.value = value;
  }

  @Override
  public String getKey() {
    return this.key;
  }

  @Override
  public String getValue() {
    return this.value;
  }

  @Override
  public String setValue(String value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map.Entry<?, ?>) {
      final Map.Entry<?, ?> that = (Map.Entry<?, ?>) other;
      return (this.key == null ? that.getKey() == null : this.key.equals(that.getKey()))
          && (this.value == null ? that.getValue() == null : this.value.equals(that.getValue()));
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
    return this.key.toString() + '=' + this.value.toString();
  }
}
