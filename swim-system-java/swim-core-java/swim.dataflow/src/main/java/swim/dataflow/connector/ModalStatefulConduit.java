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

import java.util.function.BiFunction;
import java.util.function.Function;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Conduit that maintains an external state where the function that updates the state can be modified by an auxiliary
 * control input.
 *
 * @param <In>    The input type.
 * @param <Mode>  The type of the control values.
 * @param <State> The type of the internal state.
 */
public class ModalStatefulConduit<In, Mode, State>
    extends ModalConduit<In, State, Mode, BiFunction<State, In, State>> {


  private final Function<Mode, BiFunction<State, In, State>> switcher;
  private final ValuePersister<State> state;

  @Override
  protected Deferred<BiFunction<State, In, State>> changeMode(final Deferred<Mode> mode) {
    return mode.andThen(switcher);
  }

  @Override
  protected void notifyChange(final Deferred<BiFunction<State, In, State>> modal, final Deferred<In> value) {
    final State newState = modal.get().apply(state.get(), value.get());
    state.set(newState);
    emit(newState);
  }

  /**
   * @param modePersister  External persistence for the mode.
   * @param statePersister External persistence for the state.
   * @param switcher       Controls the update function according to the mode.
   */
  public ModalStatefulConduit(final ValuePersister<Mode> modePersister,
                              final ValuePersister<State> statePersister,
                              final Function<Mode, BiFunction<State, In, State>> switcher) {
    super(modePersister, Deferred.value(switcher.apply(modePersister.get())));
    this.switcher = switcher;
    this.state = statePersister;
  }

}
