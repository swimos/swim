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

package swim.dataflow;

import java.util.Collection;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.streaming.CollectionSwimStream;
import swim.streaming.MapSwimStream;
import swim.structure.Form;

/**
 * Base implementation of streams of collections.
 *
 * @param <T> The type of the elements.
 * @param <C> The type of the collections.
 */
abstract class AbstractCollectionStream<T, C extends Collection<T>> extends AbstractSwimStream<C>
        implements CollectionSwimStream<T, C> {

  AbstractCollectionStream(final Form<C> valForm, final BindingContext con) {
    super(valForm, con);
  }

  AbstractCollectionStream(final Form<C> valForm, final BindingContext con, final ToLongFunction<C> ts) {
    super(valForm, con, ts);
  }

  @Override
  public <K, V> MapSwimStream<K, V> toMapStream(final Function<T, K> toKey, final Function<T, V> toValue,
                                                final Form<K> keyForm, final Form<V> valueForm,
                                                final boolean isTransient) {
    return new CollectionToMapStream<>(this, getContext(), toKey, toValue, keyForm, valueForm, isTransient);
  }

}
