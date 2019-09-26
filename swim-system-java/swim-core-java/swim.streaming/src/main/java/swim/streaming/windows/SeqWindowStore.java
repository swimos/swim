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

package swim.streaming.windows;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import swim.collections.FingerTrieSeq;

/**
 * Store that holds windows in a linear sequence.
 *
 * @param <W> The type of the windows.
 */
public class SeqWindowStore<W> implements WindowState<W, SeqWindowStore<W>> {

  /**
   * The sequence of the windows.
   */
  private final FingerTrieSeq<W> windows;

  public SeqWindowStore() {
    this(FingerTrieSeq.empty());
  }

  /**
   * @param init The sequence of windows for the store.
   */
  public SeqWindowStore(final FingerTrieSeq<W> init) {
    windows = init;
  }

  /**
   * @return The contents of the store.
   */
  public FingerTrieSeq<W> getWindows() {
    return windows;
  }

  @Override
  public Set<W> openWindows() {
    final HashSet<W> winSet = new HashSet<>(windows);
    return Collections.unmodifiableSet(winSet);
  }

  @Override
  public SeqWindowStore<W> removeWindow(final W window) {
    return new SeqWindowStore<>(windows.removed(window));
  }

  @Override
  public SeqWindowStore<W> addWindow(final W window) {
    if (windows.contains(window)) {
      return this;
    } else {
      return new SeqWindowStore<>(windows.appended(window));
    }
  }
}
