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

import swim.dataflow.graph.Require;
import swim.dataflow.graph.persistence.ListPersister;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialListPersister;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialValuePersister;
import swim.dataflow.graph.persistence.ValuePersister;

/**
 * Junction that buffers the values it receives and emits the values a variable number of samples previous to the
 * most recently received value.
 *
 * @param <T> The type of the values.
 */
public class VariableDelayJunction<T> extends AbstractJunction2<T, Integer, T> {

  private final ListPersister<T> persister;
  private final ValuePersister<Integer> step;

  /**
   * Store the buffer and number of delay samples persistently.
   * @param persister Persistence for the buffer.
   * @param step Persistence for the sample offset.
   */
  public VariableDelayJunction(final ListPersister<T> persister, final ValuePersister<Integer> step) {
    Require.that(step.get() != null && step.get() >= 1, "Delay must be at least 1.");
    this.persister = persister;
    this.step = step;
  }

  /**
   * Store the buffer and number of delay samples transiently.
   * @param init The initial value of the sample offset.
   */
  public VariableDelayJunction(final int init) {
    this(new TrivialListPersister<>(), new TrivialValuePersister<>(init));
  }

  @Override
  protected void notifyChangeFirst(final Deferred<T> value) {
    persister.append(value.get());
    final int bufferSize = step.get() + 1;
    persister.takeEnd(bufferSize);
    if (persister.size() == bufferSize) {
      emit(persister.get(0));
    }
  }

  @Override
  protected void notifyChangeSecond(final Deferred<Integer> value) {
    final int newStep = value.get();
    if (newStep >= 1) {
      step.set(newStep);
    }
  }
}
