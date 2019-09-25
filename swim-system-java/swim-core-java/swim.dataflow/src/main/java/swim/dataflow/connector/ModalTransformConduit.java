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

package swim.dataflow.connector;

import java.util.function.Function;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Conduit that transforms its inputs using a function that can be modified by an auxiliary control input.
 *
 * @param <In>   The input type.
 * @param <Out>  The output type.
 * @param <Mode> The type of the control values.
 */
public class ModalTransformConduit<In, Out, Mode> extends ModalConduit<In, Out, Mode, Function<In, ? extends Out>> {

  private final Function<Mode, Function<In, ? extends Out>> switcher;

  @Override
  protected Deferred<Function<In, ? extends Out>> changeMode(final Deferred<Mode> mode) {
    return mode.andThen(switcher).memoize();
  }

  @Override
  protected void notifyChange(final Deferred<Function<In, ? extends Out>> modal, final Deferred<In> value) {
    emit(Deferred.apply(modal, value));
  }

  /**
   * @param init     The initial value of the mode.
   * @param switcher Alters the transform based on the mode.
   */
  public ModalTransformConduit(final Mode init, final Function<Mode, Function<In, ? extends Out>> switcher) {
    super(switcher.apply(init));
    this.switcher = switcher;
  }

  /**
   * @param switcher Alters the transform based on the mode.
   */
  public ModalTransformConduit(final ValuePersister<Mode> modePersister,
                               final Function<Mode, Function<In, ? extends Out>> switcher) {
    super(modePersister, Deferred.value(switcher.apply(modePersister.get())));
    this.switcher = switcher;
  }

}
