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

package swim.streamlet;

import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Base class for conduits that have an auxiliary control stream to modify their behaviour.
 *
 * @param <In>    The type of the main inputs.
 * @param <Out>   The type of the outputs.
 * @param <Mode>  The type of the auxiliary control input.
 * @param <State> The type of the internal state that is modified by the control input.
 */
public abstract class ModalConduit<In, Out, Mode, State> extends AbstractJunction2<In, Mode, Out> implements Junction2<In, Mode, Out> {

  /**
   * Change current mode of the conduit.
   *
   * @param mode The control value.
   * @return The new value of the state.
   */
  protected abstract Deferred<State> changeMode(Deferred<Mode> mode);

  /**
   * Handle a change on the main input.
   *
   * @param modal The current value of the internal state.
   * @param value The new input value.
   */
  protected abstract void notifyChange(Deferred<State> modal, Deferred<In> value);

  /**
   * The internal state.
   */
  private Deferred<State> state;
  private final ValuePersister<Mode> modePersister;

  /**
   * @param init The initial value of the state.
   */
  protected ModalConduit(final State init) {
    state = Deferred.value(init);
    modePersister = null;
  }

  /**
   * @param modePersister Persistence for mode.
   * @param init The initial state.
   */
  protected ModalConduit(final ValuePersister<Mode> modePersister, final Deferred<State> init) {
    state = init;
    this.modePersister = modePersister;
  }

  protected void notifyChangeFirst(final Deferred<In> value) {
    notifyChange(state, value);
  }

  protected void notifyChangeSecond(final Deferred<Mode> value) {
    if (modePersister != null) {
      final Deferred<Mode> memVal = value.memoize();
      modePersister.set(memVal.get());
      state = changeMode(memVal);
    } else {
      state = changeMode(value);
    }
  }


}
