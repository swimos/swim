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

import swim.streaming.persistence.ListPersister;
import swim.streaming.persistence.TrivialPersistenceProvider.TrivialListPersister;
import swim.util.Deferred;
import swim.util.Require;

/**
 * Conduit that buffers the values it receives and emits the values a fixed number of samples previous to the
 * most recently received value.
 *
 * @param <T> The type of the values.
 */
public class DelayConduit<T> extends AbstractJunction<T> implements Conduit<T, T> {

  private final ListPersister<T> persister;
  private final int bufferSize;

  /**
   * Stores the buffer persistently.
   *
   * @param persister Persistence for the buffer.
   * @param step      Number of samples of delay.
   */
  public DelayConduit(final ListPersister<T> persister, final int step) {
    Require.that(step >= 1, "Delay must be at least 1.");
    this.persister = persister;
    bufferSize = step + 1;
  }

  /**
   * Stores the buffer transiently.
   *
   * @param step Number of samples of delay.
   */
  public DelayConduit(final int step) {
    this(new TrivialListPersister<>(), step);
  }

  @Override
  public void notifyChange(final Deferred<T> value) {
    persister.append(value.get());
    persister.takeEnd(bufferSize);
    if (persister.size() == bufferSize) {
      emit(persister.get(0));
    }
  }
}
