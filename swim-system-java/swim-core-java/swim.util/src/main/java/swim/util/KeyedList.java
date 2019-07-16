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

import java.util.List;
import java.util.ListIterator;
import java.util.Map;

public interface KeyedList<E> extends List<E> {
  E get(int index, Object key);

  Map.Entry<Object, E> getEntry(int index);

  Map.Entry<Object, E> getEntry(int index, Object key);

  E set(int index, E element, Object key);

  boolean add(E element, Object key);

  void add(int index, E element, Object key);

  E remove(int index, Object key);

  void move(int fromIndex, int toIndex);

  void move(int fromIndex, int toIndex, Object key);

  ListIterator<Object> keyIterator();

  ListIterator<Map.Entry<Object, E>> entryIterator();
}
