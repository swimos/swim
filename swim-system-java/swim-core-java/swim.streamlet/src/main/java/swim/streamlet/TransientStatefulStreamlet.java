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
import swim.util.Deferred;

/**
 * {@link Streamlet} that maintains an internal state.
 *
 * @param <In>    The input type.
 * @param <State> The state type.
 */
public class TransientStatefulStreamlet<In, State> extends AbstractJunction<State> implements Streamlet<In, State> {

  private final BiFunction<Deferred<State>, Deferred<In>, Deferred<State>> update;
  private Deferred<State> state;

  /**
   * @param init   Initial value of the state.
   * @param update Updates the state on new data.
   */
  public TransientStatefulStreamlet(final Deferred<State> init,
                                    final BiFunction<Deferred<State>, Deferred<In>, Deferred<State>> update) {
    this.update = update;
    state = init;
  }

  @Override
  public void notifyChange(final Deferred<In> value) {
    state = update.apply(state, value);
    emit(state);
  }

}
