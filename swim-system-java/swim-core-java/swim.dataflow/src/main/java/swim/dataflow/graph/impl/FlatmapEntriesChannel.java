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

package swim.dataflow.graph.impl;

import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.Function;
import swim.collections.HashTrieMap;
import swim.dataflow.graph.Pair;
import swim.streamlet.AbstractMapInletMapOutlet;
import swim.streamlet.KeyEffect;

/**
 * Channel that generates a new map by applying a function to entries in a source map which results in a sequence
 * of entries for the new map.
 * @param <KI> The input key type.
 * @param <KO> The output key type.
 * @param <VI> The input value type.
 * @param <VO> The output value type.
 * @param <I> The input state type.
 */
final class FlatmapEntriesChannel<KI, KO, VI, VO, I> extends AbstractMapInletMapOutlet<KI, KO, VI, VO, I, Map<KO, VO>> {

  private final BiFunction<KI, VI, Iterable<Pair<KO, VO>>> mapping;
  private final Function<KI, Set<KO>> onRemove;
  private HashTrieMap<KO, VO> state = HashTrieMap.empty();

  /**
   * @param mapping Mapping from entries into the input map to entries in the output map.
   * @param onRemove Mapping from removed keys in the input map to keys to remove from the output.
   */
  FlatmapEntriesChannel(final BiFunction<KI, VI, Iterable<Pair<KO, VO>>> mapping,
                        final Function<KI, Set<KO>> onRemove) {

    this.mapping = mapping;
    this.onRemove = onRemove;
  }

  @Override
  public boolean containsKey(final KO key) {
    return state.containsKey(key);
  }

  @Override
  public VO get(final KO key) {
    return state.get(key);
  }

  @Override
  public Map<KO, VO> get() {
    return state;
  }

  @Override
  public Iterator<KO> keyIterator() {
    return state.keyIterator();
  }

  @Override
  protected void onReconcileOutputKey(final KI key, final KeyEffect effect, final int version) {
    if (input != null) {
      switch (effect) {
        case UPDATE:
          final Iterable<Pair<KO, VO>> entries = mapping.apply(key, input.get(key));
          for (final Pair<KO, VO> entry : entries) {
            state = state.updated(entry.getFirst(), entry.getSecond());
          }
          break;
        case REMOVE:
          for (final KO remKey : onRemove.apply(key)) {
            state = state.removed(remKey);
          }
          break;

        default:
      }
    }
  }
}
