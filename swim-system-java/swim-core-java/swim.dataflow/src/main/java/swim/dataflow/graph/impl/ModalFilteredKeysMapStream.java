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
import java.util.function.Predicate;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.Junction;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.connector.ModalKeyFilterConduit;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.ValuePersister;

/**
 * Map stream where the entries are filtered according to a variable predicate on the keys only.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 * @param <M> The type of the control stream for the predicate.
 */
public class ModalFilteredKeysMapStream<K, V, M> extends AbstractMapStream<K, V> {

  private final MapSwimStream<K, V> in;
  private final M init;
  private final Function<M, Predicate<K>> switcher;
  private final SwimStream<M> control;
  private final boolean isTransient;

  /**
   * @param input          The input stream.
   * @param context        The stream initialization context.
   * @param initialMode    The initial mode.
   * @param modalPredicate The modal predicate.
   * @param controlStream  Stream of mode values to control the predicate.
   * @param isTransient    Whether the state of this stream is stored persistently.
   */
  ModalFilteredKeysMapStream(final MapSwimStream<K, V> input,
                             final BindingContext context,
                             final M initialMode,
                             final Function<M, Predicate<K>> modalPredicate,
                             final SwimStream<M> controlStream,
                             final boolean isTransient) {
    super(input.keyForm(), input.valueForm(), context);
    in = input;
    init = initialMode;
    switcher = modalPredicate;
    control = controlStream;
    this.isTransient = isTransient;
  }

  /**
   * @param input          The input stream.
   * @param context        The stream initialization context.
   * @param initialMode    The initial mode.
   * @param modalPredicate The modal predicate.
   * @param controlStream  Stream of mode values to control the predicate.
   * @param ts             Timestamp assignment for the values.
   * @param isTransient    Whether the state of this stream is stored persistently.
   */
  ModalFilteredKeysMapStream(final MapSwimStream<K, V> input,
                             final BindingContext context,
                             final M initialMode,
                             final Function<M, Predicate<K>> modalPredicate,
                             final SwimStream<M> controlStream,
                             final boolean isTransient,
                             final ToLongFunction<V> ts) {
    super(input.keyForm(), input.valueForm(), context, ts);
    in = input;
    init = initialMode;
    switcher = modalPredicate;
    control = controlStream;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new ModalFilteredKeysMapStream<>(in, getContext(), init, switcher, control, isTransient, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(in);
    final Junction<M> modes = context.createFor(control);
    final ModalKeyFilterConduit<K, V, M> conduit;
    if (isTransient) {
      conduit = new ModalKeyFilterConduit<>(init, switcher);
    } else {
      final ValuePersister<M> modePersister = context.getPersistenceProvider().forValue(
          StateTags.modeTag(id()), control.form(), init);
      conduit = new ModalKeyFilterConduit<>(modePersister, switcher);
    }
    source.subscribe(conduit.first());
    modes.subscribe(conduit.second());
    return conduit;
  }
}
