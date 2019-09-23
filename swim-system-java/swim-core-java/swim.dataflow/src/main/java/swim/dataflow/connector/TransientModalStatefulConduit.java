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

/**
 * Conduit that maintains an internal state where the function that updates the state can be modified by an auxiliary
 * control input.
 *
 * @param <In>    The input type.
 * @param <Mode>  The type of the control values.
 * @param <State> The type of the internal state.
 */
public final class TransientModalStatefulConduit<In, Mode, State>
    extends ModalConduit<In, State, Mode, BiFunction<Deferred<State>, Deferred<In>, Deferred<State>>> {

  private Deferred<State> state;
  private final Function<Mode, BiFunction<Deferred<State>, Deferred<In>, Deferred<State>>> switcher;

  /**
   * @param initMode The initial value of the mode.
   * @param init     The initial value of the state.
   * @param switcher Controls the update function according to the mode.
   */
  public TransientModalStatefulConduit(final Mode initMode,
                                       final Deferred<State> init,
                                       final Function<Mode, BiFunction<Deferred<State>, Deferred<In>, Deferred<State>>> switcher) {
    super(switcher.apply(initMode));
    state = init;
    this.switcher = switcher;
  }

  protected void notifyChange(final Deferred<BiFunction<Deferred<State>, Deferred<In>, Deferred<State>>> modal,
                              final Deferred<In> value) {
    final Deferred<State> current = state;
    state = modal.andThen(upd -> upd.apply(current, value).get());
    emit(state);
  }

  @Override
  protected Deferred<BiFunction<Deferred<State>, Deferred<In>, Deferred<State>>> changeMode(final Deferred<Mode> mode) {
    return mode.andThen(switcher).memoize();
  }
}
