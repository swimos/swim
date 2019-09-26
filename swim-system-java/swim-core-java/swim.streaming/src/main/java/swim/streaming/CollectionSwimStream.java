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

package swim.streaming;

import java.util.Collection;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.structure.Form;

/**
 * Specialization of {@link SwimStream} for collections.
 *
 * @param <T> The type of the elements.
 * @param <C> The collection type.
 */
public interface CollectionSwimStream<T, C extends Collection<T>> extends SwimStream<C> {

  /**
   * Convert this stream to a map stream where elements in the map are derived from elements of
   * the collections.
   *
   * @param toKey     Function from stream values to map keys.
   * @param toValue   Function from stream values to map values.
   * @param keyForm   The form of the type of the keys.
   * @param valueForm The form of the type of the values.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param <K>       The type of the keys.
   * @param <V>       The type of the values.
   * @return The map stream.
   */
  <K, V> MapSwimStream<K, V> toMapStream(Function<T, K> toKey, Function<T, V> toValue,
                                         Form<K> keyForm, Form<V> valueForm,
                                         boolean isTransient);

  /**
   * Convert this stream to a map stream where elements in the map are derived from elements of
   * the collections.
   *
   * @param toKey     Function from stream values to map keys.
   * @param toValue   Function from stream values to map values.
   * @param keyForm   The form of the type of the keys.
   * @param valueForm The form of the type of the values.
   * @param <K>       The type of the keys.
   * @param <V>       The type of the values.
   * @return The map stream.
   */
  default <K, V> MapSwimStream<K, V> toMapStream(final Function<T, K> toKey, final Function<T, V> toValue,
                                                 final Form<K> keyForm, final Form<V> valueForm) {
    return toMapStream(toKey, toValue, keyForm, valueForm, false);
  }

  @Override
  CollectionSwimStream<T, C> updateTimestamps(ToLongFunction<C> datation);

}
