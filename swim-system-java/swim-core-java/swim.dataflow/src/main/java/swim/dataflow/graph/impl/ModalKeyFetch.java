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

import java.util.function.ToLongFunction;
import swim.dataflow.connector.Junction;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.connector.ModalKeyFetchConduit;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.StreamInterpretation;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.dataflow.graph.sampling.Sampling;

/**
 * A stream of values for a specified key in a map stream. The selected key can be modified by a control stream.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class ModalKeyFetch<K, V> extends AbstractSwimStream<V> {

  private final MapSwimStream<K, V> keyedStream;
  private final SwimStream<K> keys;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param stream        The source map stream.
   * @param context       The instantiation context.
   * @param selector      The key selection stream.
   * @param samplingStrat The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalKeyFetch(final MapSwimStream<K, V> stream,
                final BindingContext context,
                final SwimStream<K> selector,
                final Sampling samplingStrat,
                final boolean isTransient) {
    super(stream.valueForm(), context);
    keyedStream = stream;
    keys = selector;
    sampling = samplingStrat;
    this.isTransient = isTransient;
  }

  ModalKeyFetch(final MapSwimStream<K, V> stream,
                final BindingContext context,
                final SwimStream<K> selector,
                final Sampling samplingStrat,
                final boolean isTransient,
                final ToLongFunction<V> ts) {
    super(stream.valueForm(), context, ts);
    keyedStream = stream;
    keys = selector;
    sampling = samplingStrat;
    this.isTransient = isTransient;
  }

  @Override
  public SwimStream<V> updateTimestamps(final ToLongFunction<V> datation) {
    return new ModalKeyFetch<>(keyedStream, getContext(), keys, sampling, isTransient, datation);
  }

  @Override
  public Junction<V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(keyedStream);
    final Junction<K> control = context.createFor(keys);
    final ModalKeyFetchConduit<K, V> selector;
    if (isTransient) {
      selector = new ModalKeyFetchConduit<>();
    } else {
      final ValuePersister<K> keyPersister = context.getPersistenceProvider().forValue(
          StateTags.modeTag(id()), keys.form());
      selector = new ModalKeyFetchConduit<>(keyPersister);
    }
    control.subscribe(selector.keySelector());
    source.subscribe(selector.mapInput());
    return StreamDecoupling.sampleStream(id(), context, selector, sampling, StreamInterpretation.DISCRETE);
  }

}

