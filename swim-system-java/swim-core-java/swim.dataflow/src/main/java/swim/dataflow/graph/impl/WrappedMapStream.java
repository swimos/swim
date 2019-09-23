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

package swim.dataflow.graph.impl;

import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.Junction;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.connector.StatefulMapCollector;
import swim.dataflow.connector.TransientMapCollector;
import swim.dataflow.connector.ValueToMapConduit;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.MapPersister;
import swim.structure.Form;

/**
 * Map stream generated from a standard stream.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
class WrappedMapStream<K, V> extends AbstractMapStream<K, V> {

  private final SwimStream<V> inner;
  private final Function<V, K> keys;
  private final boolean isTransient;

  /**
   * @param toWrap  The stream to wrap.
   * @param context The instantiation context.
   * @param keyFun  Assigns keys to values.
   * @param kform   The form of the keys.
   * @param isTransient   Whether the state of this stream is stored persistently.
   */
  WrappedMapStream(final SwimStream<V> toWrap,
                   final BindingContext context,
                   final Function<V, K> keyFun,
                   final Form<K> kform,
                   final boolean isTransient) {
    super(kform, toWrap.form(), context);
    inner = toWrap;
    keys = keyFun;
    this.isTransient = isTransient;
  }

  /**
   * @param toWrap  The stream to wrap.
   * @param context The instantiation context.
   * @param keyFun  Assigns keys to values.
   * @param kform   The form of the keys.
   * @param ts      Timestamp assignment for the values.
   * @param isTransient   Whether the state of this stream is stored persistently.
   */
  WrappedMapStream(final SwimStream<V> toWrap,
                   final BindingContext context,
                   final Function<V, K> keyFun,
                   final Form<K> kform,
                   final boolean isTransient,
                   final ToLongFunction<V> ts) {
    super(kform, toWrap.form(), context, ts);
    inner = toWrap;
    keys = keyFun;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new WrappedMapStream<>(inner, getContext(), keys, keyForm(), isTransient, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<V> source = context.createFor(inner);
    final ValueToMapConduit<V, K, V> collector;
    if (isTransient) {
      collector = new TransientMapCollector<>(keys, x -> x);
    } else {
      final MapPersister<K, V> persister = context.getPersistenceProvider().forMap(
          StateTags.stateTag(id()), keyForm(), valueForm());
      collector = new StatefulMapCollector<>(keys, x -> x, persister);
    }
    source.subscribe(collector);
    return collector;
  }

}
