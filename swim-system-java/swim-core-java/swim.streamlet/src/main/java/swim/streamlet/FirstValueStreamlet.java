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

import swim.streaming.persistence.TrivialPersistenceProvider.TrivialValuePersister;
import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * A streamlet that only emits the first value it receives.
 *
 * @param <T> The type of the values.
 */
public class FirstValueStreamlet<T> extends AbstractJunction<T> implements Streamlet<T, T> {

  private final ValuePersister<T> persister;

  /**
   * Store the first value persistently.
   *
   * @param persister Persistence for the value.
   */
  public FirstValueStreamlet(final ValuePersister<T> persister) {
    this.persister = persister;
  }

  /**
   * Store the first value transiently.
   */
  public FirstValueStreamlet() {
    this(new TrivialValuePersister<>(null));
  }

  @Override
  public void notifyChange(final Deferred<T> value) {
    final T fromState = persister.get();
    if (fromState == null) {
      final T first = value.get();
      persister.set(value.get());
      emit(first);
    }
  }
}
