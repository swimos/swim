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

package swim.dataflow.graph.persistence;

import java.util.List;

/**
 * Provides durable persistence for a list.
 * @param <T> The type of the elments.
 */
public interface ListPersister<T> {

  /**
   * Retreive the value at the given index.
   * @param index The index.
   * @return The value, if it exists.
   */
  T get(int index);

  /**
   * @param value Append this value to the list.
   */
  void append(T value);

  /**
   * @param value Prepend this value to the list.
   */
  void prepend(T value);

  /**
   * @return The size of the list.
   */
  int size();

  /**
   * @param n Drop the first {@code n} elements of the list.
   */
  void drop(int n);

  /**
   * @param n Retain only the first {@code n} elements of the list.
   */
  void take(int n);

  /**
   * @param n Drop the last {@code n} elements of the list.
   */
  default void dropEnd(final int n) {
    take(size() - n);
  }

  /**
   * @param n Retain only the last {@code n} elements of the list.
   */
  default void takeEnd(final int n) {
    drop(size() - n);
  }

  /**
   * @return A snapshot of the state of the list.
   */
  List<T> get();

  /**
   * Close this persister. It should not be used afterwards.
   */
  void close();

}
