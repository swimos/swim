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
import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.Junction;
import swim.streamlet.UnionJunction;
import swim.structure.Form;

/**
 * Stream formed by the union of two or more other streams.
 *
 * @param <T> The type of the values.
 */
class UnionStream<T> extends AbstractSwimStream<T> {

  private final FingerTrieSeq<SwimStream<? extends T>> parts;

  /**
   * @param form    The form of the type of the values.
   * @param partSeq The component streams.
   * @param context The instantiation context.
   */
  UnionStream(final Form<T> form, final FingerTrieSeq<SwimStream<? extends T>> partSeq, final BindingContext context) {
    super(form, context);
    parts = partSeq;
  }

  UnionStream(final Form<T> form, final FingerTrieSeq<SwimStream<? extends T>> partSeq,
              final BindingContext context,
              final ToLongFunction<T> ts) {
    super(form, context, ts);
    parts = partSeq;
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new UnionStream<>(form(), parts, getContext(), datation);
  }

  @Override
  public SwimStream<T> union(final Iterable<SwimStream<? extends T>> others) {
    FingerTrieSeq<SwimStream<? extends T>> newParts = parts;
    for (final SwimStream<? extends T> other : others) {
      newParts = newParts.appended(other);
    }
    return new UnionStream<>(form(), newParts, getContext());
  }

  @Override
  public SwimStream<T> union(final SwimStream<? extends T> other) {
    return new UnionStream<>(form(), parts.appended(other), getContext());
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final UnionJunction<T> junction = new UnionJunction<>(parts.size());
    int i = 0;
    for (final SwimStream<? extends T> stream : parts) {
      final Junction<? extends T> source = context.createFor(stream);
      source.subscribe(junction.getInput(i));
      ++i;
    }
    return junction;
  }
}
