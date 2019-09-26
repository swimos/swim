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

import java.util.function.Supplier;
import java.util.function.ToLongFunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.Junction;
import swim.structure.Form;

/**
 * Stream drawing value from an external source.
 *
 * @param <T> The type of the values.
 */
final class ExternalOutletStream<T> extends AbstractSwimStream<T> {

  private final Supplier<Junction<T>> outlet;

  /**
   * @param valForm   The form of the types of the values.
   * @param context   The instantiation context.
   * @param junctionSupplier Supplier for the source junction.
   * @param ts        Assigns timestamps to the values.
   */
  ExternalOutletStream(final Form<T> valForm,
                       final BindingContext context,
                       final Supplier<Junction<T>> junctionSupplier,
                       final ToLongFunction<T> ts) {
    super(valForm, context, ts);
    outlet = junctionSupplier;
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new ExternalOutletStream<>(form(), getContext(), outlet, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {

    return outlet.get();
  }

}
