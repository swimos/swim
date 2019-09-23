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

import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.JoinOnKeyJunction;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.sampling.Sampling;
import swim.structure.Form;

/**
 * Stream formed by the join of two map streams with a common key.
 *
 * @param <K>  The type of the keys.
 * @param <V1> The type of the left values.
 * @param <V2> The type of the right values.
 * @param <U>  The type of the combination of the two values.
 */
class JoinedStream<K, V1, V2, U> extends AbstractMapStream<K, U> {

  private final MapSwimStream<K, V1> left;
  private final MapSwimStream<K, V2> right;
  private final BiFunction<V1, V2, U> combiner;
  private final Function<V1, U> leftOnly;
  private final Function<V2, U> rightOnly;
  private final Sampling sampling;

  /**
   * @param leftStream    The stream on the left of the join.
   * @param rightStream   The stream on the right of the join.
   * @param context       The instantiation context.
   * @param form          The form of the type of the output values.
   * @param combinFun     Function to combine left and right values.
   * @param leftFun       Function to provide a value when only the left value is present (may be null).
   * @param rightFun      Function to provide the value when only the right value is present (may be null).
   * @param samplingStrat Sampling strategy for the link.
   */
  JoinedStream(final MapSwimStream<K, V1> leftStream,
               final MapSwimStream<K, V2> rightStream,
               final BindingContext context,
               final Form<U> form,
               final BiFunction<V1, V2, U> combinFun,
               final Function<V1, U> leftFun,
               final Function<V2, U> rightFun,
               final Sampling samplingStrat) {
    super(leftStream.keyForm(), form, context);
    combiner = combinFun;
    leftOnly = leftFun;
    rightOnly = rightFun;
    left = leftStream;
    right = rightStream;
    sampling = samplingStrat;
  }

  /**
   * @param leftStream    The stream on the left of the join.
   * @param rightStream   The stream on the right of the join.
   * @param context       The instantiation context.
   * @param form          The form of the type of the output values.
   * @param combinFun     Function to combine left and right values.
   * @param leftFun       Function to provide a value when only the left value is present (may be null).
   * @param rightFun      Function to provide the value when only the right value is present (may be null).
   * @param samplingStrat Sampling strategy for the link.
   * @param ts            Timestamp assignment for the values.
   */
  JoinedStream(final MapSwimStream<K, V1> leftStream,
               final MapSwimStream<K, V2> rightStream,
               final BindingContext context,
               final Form<U> form,
               final BiFunction<V1, V2, U> combinFun,
               final Function<V1, U> leftFun,
               final Function<V2, U> rightFun,
               final Sampling samplingStrat,
               final ToLongFunction<U> ts) {
    super(leftStream.keyForm(), form, context, ts);
    combiner = combinFun;
    leftOnly = leftFun;
    rightOnly = rightFun;
    left = leftStream;
    right = rightStream;
    sampling = samplingStrat;

  }

  @Override
  public MapSwimStream<K, U> updateTimestamps(final ToLongFunction<U> datation) {
    return new JoinedStream<>(left, right, getContext(), valueForm(), combiner, leftOnly, rightOnly, sampling, datation);
  }

  @Override
  public MapJunction<K, U> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V1> leftSource = context.createFor(left);
    final MapJunction<K, V2> rightSource = context.createFor(right);
    final JoinOnKeyJunction<K, V1, V2, U> junction = new JoinOnKeyJunction<>(combiner, leftOnly, rightOnly);
    leftSource.subscribe(junction.first());
    rightSource.subscribe(junction.second());
    return junction;
  }
}
