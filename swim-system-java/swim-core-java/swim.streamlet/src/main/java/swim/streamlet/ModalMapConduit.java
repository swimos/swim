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

import swim.streaming.MapView;
import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Base class for map conduits that have an auxiliary control stream to modify their behaviour.
 *
 * @param <KeyIn>  The type of the input keys.
 * @param <KeyOut> The type of the output keys.
 * @param <ValIn>  The type of the input values.
 * @param <ValOut> The type of the output values.
 * @param <Mode>   The type of the auxiliary control input.
 * @param <State>  The type of the internal state that is modified by the control input.
 */
public abstract class ModalMapConduit<KeyIn, KeyOut, ValIn, ValOut, Mode, State> extends AbstractMapJunction2<KeyIn, KeyOut, ValIn, ValOut, Mode> {

  /**
   * Update the state for a new mode.
   *
   * @param mode The mode.
   * @return The updated state value.
   */
  protected abstract Deferred<State> changeMode(Deferred<Mode> mode);

  /**
   * Called after the state changes.
   * @param state The new state.
   */
  protected void didChangeMode(final Deferred<State> state) {

  }

  private Deferred<State> state;
  private final ValuePersister<Mode> modePersister;

  /**
   * @param init The initial value of the state.
   */
  protected ModalMapConduit(final State init) {
    state = Deferred.value(init);
    this.modePersister = null;
  }

  protected ModalMapConduit(final ValuePersister<Mode> modePersister, final State init) {
    this.modePersister = modePersister;
    state = Deferred.value(init);
  }

  /**
   * Handle an update on the main channel.
   *
   * @param state The current value of the state.
   * @param keyIn The updated key.
   * @param value The new value.
   * @param map   View on the current state of the map.
   */
  protected abstract void notifyChange(Deferred<State> state,
                                       KeyIn keyIn,
                                       Deferred<ValIn> value,
                                       Deferred<MapView<KeyIn, ValIn>> map);

  /**
   * Handle a removal on the main channel.
   *
   * @param state The current value of the state.
   * @param keyIn The removed key.
   * @param map   View on the current state of the map.
   */
  protected abstract void notifyRemoval(Deferred<State> state,
                                        KeyIn keyIn,
                                        Deferred<MapView<KeyIn, ValIn>> map);

  @Override
  protected final void notifyChange(final KeyIn keyIn, final Deferred<ValIn> value, final Deferred<MapView<KeyIn, ValIn>> map) {
    notifyChange(state, keyIn, value, map);
  }

  @Override
  protected void notifyRemoval(final KeyIn keyIn, final Deferred<MapView<KeyIn, ValIn>> map) {
    notifyRemoval(state, keyIn, map);
  }

  @Override
  protected final void notifyChange(final Deferred<Mode> value) {
    if (modePersister != null) {
      final Deferred<Mode> memVal = value.memoize();
      modePersister.set(memVal.get());
      state = changeMode(memVal);
    } else {
      state = changeMode(value);
    }
    didChangeMode(state);
  }
}
