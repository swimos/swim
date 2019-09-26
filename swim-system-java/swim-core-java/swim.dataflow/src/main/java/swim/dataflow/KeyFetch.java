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

import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.sampling.Sampling;
import swim.streamlet.IdentityConduit;
import swim.streamlet.StreamInterpretation;
import swim.structure.Form;

/**
 * A stream of values for a specified key in a map stream.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
class KeyFetch<K, V> extends AbstractSwimStream<V> {

  private final MapSwimStream<K, V> keyedStream;

  private final K key;

  private final Sampling sampling;

  /**
   * @param stream        The source map stream.
   * @param context       The instantiation context.
   * @param selector      The key to select.
   * @param samplingStrat The sampling strategy for the link.
   */
  KeyFetch(final MapSwimStream<K, V> stream,
           final BindingContext context,
           final K selector,
           final Sampling samplingStrat) {
    super(stream.valueForm(), context);
    keyedStream = stream;
    key = selector;
    sampling = samplingStrat;
  }

  /**
   * @param stream        The source map stream.
   * @param context       The instantiation context.
   * @param selector      The key to select.
   * @param samplingStrat The sampling strategy for the link.
   * @param ts            Time stamp assigner for the stream.
   */
  KeyFetch(final MapSwimStream<K, V> stream,
           final BindingContext context,
           final K selector,
           final Form<V> valForm,
           final Sampling samplingStrat,
           final ToLongFunction<V> ts) {
    super(stream.valueForm(), context, ts);
    keyedStream = stream;
    key = selector;
    sampling = samplingStrat;
  }

  @Override
  public SwimStream<V> updateTimestamps(final ToLongFunction<V> datation) {
    return new KeyFetch<>(keyedStream, getContext(), key, form(), sampling, datation);
  }

  @Override
  public Junction<V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(keyedStream);
    final IdentityConduit<V> identity = new IdentityConduit<>();
    source.subscribe(key, identity);
    return StreamDecoupling.sampleStream(id(), context, identity, sampling, StreamInterpretation.DISCRETE);
  }

}
