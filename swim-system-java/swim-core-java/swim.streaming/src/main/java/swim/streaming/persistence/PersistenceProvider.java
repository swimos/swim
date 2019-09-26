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

package swim.streaming.persistence;

import swim.structure.Form;
import swim.structure.Text;
import swim.structure.Value;

/**
 * Provides persistence of values for data-flow components.
 */
public interface PersistenceProvider {

  /**
   * Get a persister for a simple value.
   *
   * @param name The unique name for the persister.
   * @param form The form of the type of the value.
   * @param <T>  The type of the value.
   * @return The persister.
   */
  default <T> ValuePersister<T> forValue(final String name, final Form<T> form) {
    return forValue(Text.from(name), form);
  }

  /**
   * Get a persister for a simple value.
   *
   * @param key  The unique key for the persister.
   * @param form The form of the type of the value.
   * @param <T>  The type of the value.
   * @return The persister.
   */
  <T> ValuePersister<T> forValue(Value key, Form<T> form);

  /**
   * Get a persister for a simple value.
   *
   * @param key  The unique key for the persister.
   * @param form The form of the type of the value.
   * @param init The initial value.
   * @param <T>  The type of the value.
   * @return The persister.
   */
  default <T> ValuePersister<T> forValue(final Value key, final Form<T> form, final T init) {
    return forValue(key, form.unit(init));
  }

  /**
   * Get a persister for a simple value.
   *
   * @param name The unique name for the persister.
   * @param form The form of the type of the value.
   * @param init The initial value.
   * @param <T>  The type of the values.
   * @return The persister.
   */
  default <T> ValuePersister<T> forValue(final String name, final Form<T> form, final T init) {
    return forValue(name, form.unit(init));
  }

  /**
   * Get a persister for a list of values.
   *
   * @param name The unique name for the persister.
   * @param form The form of the type of the elements.
   * @param <T>  The type of the values.
   * @return The persister.
   */
  default <T> ListPersister<T> forList(final String name, final Form<T> form) {
    return forList(Text.from(name), form);
  }

  /**
   * Get a persister for a set of values.
   *
   * @param key  The unique key for the persister.
   * @param form The form of the type of the elements.
   * @param <T>  The type of the valuse.
   * @return The persister.
   */
  <T> SetPersister<T> forSet(Value key, Form<T> form);

  /**
   * Get a persister for a set of values.
   *
   * @param name The unique name for the persister.
   * @param form The form of the type of the elements.
   * @param <T>  The type of the value.
   * @return The persister.
   */
  default <T> SetPersister<T> forSet(final String name, final Form<T> form) {
    return forSet(Text.from(name), form);
  }

  /**
   * Get a persister for a list of values.
   *
   * @param key  The unique key for the persister.
   * @param form The form of the type of the elements.
   * @param <T>  The type of the value.
   * @return The persister.
   */
  <T> ListPersister<T> forList(Value key, Form<T> form);

  /**
   * Get a persister for a map.
   *
   * @param key     The unique key for the persister.
   * @param keyForm The form of the type of the keys.
   * @param valForm The form of the type of the values.
   * @param <K>     The type of the keys.
   * @param <V>     The type of the values.
   * @return The persister.
   */
  <K, V> MapPersister<K, V> forMap(Value key, Form<K> keyForm, Form<V> valForm);

  /**
   * Get a persister for a map.
   *
   * @param key     The unique key for the persister.
   * @param keyForm The form of the type of the keys.
   * @param valForm The form of the type of the values.
   * @param init    The initial value.
   * @param <K>     The type of the keys.
   * @param <V>     The type of the values.
   * @return The persister.
   */
  default <K, V> MapPersister<K, V> forMap(final Value key,
                                           final Form<K> keyForm, final Form<V> valForm, final V init) {
    return forMap(key, keyForm, valForm.unit(init));
  }

  /**
   * Get a persister for a map.
   *
   * @param name    The unique name for the persister.
   * @param keyForm The form of the type of the keys.
   * @param valForm The form of the type of the values.
   * @param <K>     The type of the keys.
   * @param <V>     The type of the values.
   * @return The persister.
   */
  default <K, V> MapPersister<K, V> forMap(final String name, final Form<K> keyForm, final Form<V> valForm) {
    return forMap(Text.from(name), keyForm, valForm);
  }

  /**
   * Get a persister for a map.
   *
   * @param name    The unique name for the persister.
   * @param keyForm The form of the type of the keys.
   * @param valForm The form of the type of the values.
   * @param init    The initial value.
   * @param <K>     The type of the keys.
   * @param <V>     The type of the values.
   * @return The persister.
   */
  default <K, V> MapPersister<K, V> forMap(final String name,
                                           final Form<K> keyForm, final Form<V> valForm, final V init) {
    return forMap(name, keyForm, valForm.unit(init));
  }

}
