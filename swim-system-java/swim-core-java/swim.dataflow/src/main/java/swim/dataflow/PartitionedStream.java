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
import swim.dataflow.partitions.PartitionConduit;
import swim.streaming.Junction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.MapPersister;
import swim.streaming.sampling.Sampling;
import swim.streaming.windows.PartitionAssigner;
import swim.streaming.windows.PartitionState;
import swim.streamlet.StreamInterpretation;
import swim.structure.Form;

/**
 * A stream that has been split into partitions, forming a map stream.
 *
 * @param <T> The type of the values.
 * @param <P> The type of the partitions (forming the keys of the map).
 * @param <S> The type of the state tracking the partitions.
 */
class PartitionedStream<T, P, S extends PartitionState<P, S>> extends AbstractMapStream<P, T> {

  private final SwimStream<T> in;
  private final PartitionAssigner<T, P, S> assigner;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param input         The input stream.
   * @param context       Graph instantiation context,.
   * @param partAssigner  Assignment of partitions to values.
   * @param partForm      The form of the partitions.
   * @param samplingStrat The sampling strategy for the link.
   * @param isTransient   Whether the state of this stream is stored persistently.
   */
  PartitionedStream(final SwimStream<T> input,
                    final BindingContext context,
                    final PartitionAssigner<T, P, S> partAssigner,
                    final Form<P> partForm,
                    final Sampling samplingStrat,
                    final boolean isTransient) {
    super(partForm, input.form(), context);
    in = input;
    assigner = partAssigner;
    sampling = samplingStrat;
    this.isTransient = isTransient;
  }

  /**
   * @param input         The input stream.
   * @param context       Graph instantiation context,.
   * @param partAssigner  Assignment of partitions to values.
   * @param partForm      The form of the partitions.
   * @param samplingStrat The sampling strategy for the link.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param ts            Timestamp assignment for the values.
   */
  PartitionedStream(final SwimStream<T> input,
                    final BindingContext context,
                    final PartitionAssigner<T, P, S> partAssigner,
                    final Form<P> partForm,
                    final Sampling samplingStrat,
                    final boolean isTransient,
                    final ToLongFunction<T> ts) {
    super(partForm, input.form(), context, ts);
    in = input;
    assigner = partAssigner;
    sampling = samplingStrat;
    this.isTransient = isTransient;
  }

  @Override
  public MapJunction<P, T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<T> source = StreamDecoupling.sampleStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);
    final PartitionConduit<T, P, S> conduit;
    if (isTransient) {
      conduit = new PartitionConduit<>(assigner, valueForm());
    } else {
      final MapPersister<P, T> persister = context.getPersistenceProvider().forMap(
          StateTags.stateTag(id()), keyForm(), valueForm());
      conduit = new PartitionConduit<>(assigner, persister);
    }
    source.subscribe(conduit);
    return conduit;
  }

  @Override
  public MapSwimStream<P, T> updateTimestamps(final ToLongFunction<T> datation) {
    return new PartitionedStream<>(in, getContext(), assigner, keyForm(), sampling, isTransient, datation);
  }
}
