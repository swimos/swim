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

package swim.dataflow.graph.impl.windows;

import java.util.Optional;
import java.util.Set;
import swim.streamlet.persistence.MapPersister;

/**
 * {@link WindowAccumulators} backed by a {@link MapPersister} state store.
 * @param <W> The type of the windows.
 * @param <S> The type of the states.
 */
public class PersisterAccumulators<W, S> implements WindowAccumulators<W, S> {

  private final MapPersister<W, S> persister;

  public PersisterAccumulators(final MapPersister<W, S> persister) {
    this.persister = persister;
  }

  @Override
  public Optional<S> getForWindow(final W window) {
    return Optional.ofNullable(persister.get(window));
  }

  @Override
  public void updateWindow(final W window, final S state) {
    persister.put(window, state);
  }

  @Override
  public void removeWindow(final W window) {
    persister.remove(window);
  }

  @Override
  public Set<W> windows() {
    return persister.keys();
  }

  @Override
  public void close() {
    persister.close();
  }
}
