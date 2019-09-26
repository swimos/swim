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

import java.util.function.BiFunction;
import swim.streamlet.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * {@link Conduit} that maintains an external state.
 *
 * @param <In>    The input type.
 * @param <State> The state type.
 */
public class StatefulConduit<In, State> extends AbstractJunction<State> implements Conduit<In, State> {

  private final ValuePersister<State> state;
  private final BiFunction<State, In, State> update;

  /**
   * @param state  External persistence for the state.
   * @param update Updates the state on new data.
   */
  public StatefulConduit(final ValuePersister<State> state,
                         final BiFunction<State, In, State> update) {
    this.state = state;
    this.update = update;
  }

  @Override
  public void notifyChange(final Deferred<In> value) {
    final State newState = update.apply(state.get(), value.get());
    state.set(newState);
    emit(newState);
  }
}
