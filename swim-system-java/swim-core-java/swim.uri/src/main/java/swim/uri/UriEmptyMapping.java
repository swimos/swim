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

import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.Set;

final class UriEmptyMapping<T> extends UriTerminalMapper<T> {
  @Override
  public boolean isEmpty() {
    return true;
  }

  @Override
  public int size() {
    return 0;
  }

  @Override
  public boolean containsValue(Object value) {
    return false;
  }

  @Override
  UriMapper<T> getSuffix() {
    return this;
  }

  @Override
  T get() {
    return null;
  }

  @Override
  public Set<Entry<Uri, T>> entrySet() {
    return Collections.emptySet();
  }

  @Override
  public Set<Uri> keySet() {
    return Collections.emptySet();
  }

  @Override
  public Collection<T> values() {
    return Collections.emptyList();
  }

  @Override
  public Iterator<Entry<Uri, T>> iterator() {
    return Collections.emptyIterator();
  }

  @Override
  public Iterator<Uri> keyIterator() {
    return Collections.emptyIterator();
  }

  @Override
  public Iterator<T> valueIterator() {
    return Collections.emptyIterator();
  }
}
