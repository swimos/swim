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

import java.util.function.Predicate;
import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streamlet.FilteredConduit;

/**
 * A filtered view of a stream.
 *
 * @param <T> The type of the values.
 */
class FilteredStream<T> extends AbstractSwimStream<T> {

  private final SwimStream<T> in;
  private final Predicate<T> predicate;

  /**
   * @param input   The input stream.
   * @param context The instantiation context.
   * @param pred    The predicate to filter the stream.
   */
  FilteredStream(final SwimStream<T> input,
                 final BindingContext context,
                 final Predicate<T> pred) {
    super(input.form(), context);
    in = input;
    predicate = pred;
  }

  /**
   * @param input   The input stream.
   * @param context The instantiation context.
   * @param pred    The predicate to filter the stream.
   * @param ts      Time-stamp assigner for the stream.
   */
  FilteredStream(final SwimStream<T> input,
                 final BindingContext context,
                 final Predicate<T> pred,
                 final ToLongFunction<T> ts) {
    super(input.form(), context, ts);
    in = input;
    predicate = pred;
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new FilteredStream<>(in, getContext(), predicate, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<T> source = context.createFor(in);
    final FilteredConduit<T> conduit = new FilteredConduit<>(predicate);
    source.subscribe(conduit);
    return conduit;
  }

}


