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

import java.util.Collection;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.Junction;
import swim.dataflow.connector.TransformConduit;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.CollectionSwimStream;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.structure.Form;

/**
 * A stream of collections derived from another stream.
 *
 * @param <T> The type of the input values.
 * @param <U> The type of the elements of the collections.
 * @param <C> The type of the collections.
 */
class TransformedColStream<T, U, C extends Collection<U>> extends AbstractCollectionStream<U, C> {

  private final SwimStream<T> in;
  private final Function<T, C> f;
  private final boolean memoizeValue;

  /**
   * @param input     The source stream.
   * @param context   The instantiation context.
   * @param transform The transformation.
   * @param memoize Whether to memoize the result.
   * @param form      The form of the type of the collections.
   */
  TransformedColStream(final SwimStream<T> input, final BindingContext context, final Function<T, C> transform,
                       final boolean memoize, final Form<C> form) {
    super(form, context);
    in = input;
    f = transform;
    memoizeValue = memoize;
  }

  /**
   * @param input     The source stream.
   * @param context   The instantiation context.
   * @param transform The transformation.
   *  @param memoize Whether to memoize the result.
   * @param form      The form of the type of the collections.
   * @param ts        Timestamp assigner for the stream.
   */
  TransformedColStream(final SwimStream<T> input, final BindingContext context, final Function<T, C> transform,
                       final boolean memoize, final Form<C> form,
                       final ToLongFunction<C> ts) {
    super(form, context, ts);
    in = input;
    f = transform;
    memoizeValue = memoize;
  }

  @Override
  public CollectionSwimStream<U, C> updateTimestamps(final ToLongFunction<C> datation) {
    return new TransformedColStream<>(in, getContext(), f, memoizeValue, form(), datation);
  }

  @Override
  public Junction<C> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<T> source = context.createFor(in);
    final TransformConduit<T, C> conduit = new TransformConduit<>(f);
    source.subscribe(conduit);
    return conduit;
  }
}
