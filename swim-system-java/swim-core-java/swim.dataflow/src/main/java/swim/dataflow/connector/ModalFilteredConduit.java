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
import java.util.function.Predicate;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Filtered conduit where the behaviour of the filtering is controlled by an auxiliary input.
 *
 * @param <T>    The type of the data.
 * @param <Mode> The type of the auxiliary control values.
 */
public class ModalFilteredConduit<T, Mode> extends ModalConduit<T, T, Mode, Predicate<T>> {

  private final Function<Mode, Predicate<T>> switcher;

  /**
   * @param init     The initial mode.
   * @param switcher Switches the predicate according to the mode.
   */
  public ModalFilteredConduit(final Mode init, final Function<Mode, Predicate<T>> switcher) {
    super(switcher.apply(init));
    this.switcher = switcher;
  }

  /**
   * @param modePersister Persistence for the mode.
   * @param switcher      Switches the predicate according to the mode.
   */
  public ModalFilteredConduit(final ValuePersister<Mode> modePersister, final Function<Mode, Predicate<T>> switcher) {
    super(modePersister, Deferred.value(switcher.apply(modePersister.get())));
    this.switcher = switcher;
  }

  @Override
  protected Deferred<Predicate<T>> changeMode(final Deferred<Mode> mode) {
    return mode.andThen(switcher).memoize();
  }

  @Override
  protected void notifyChange(final Deferred<Predicate<T>> modal, final Deferred<T> value) {
    final Deferred<T> memoized = value.memoize();
    if (modal.get().test(memoized.get())) {
      emit(memoized);
    }
  }
}
