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

package swim.dataflow.graph.windows;

import java.util.Collections;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.HashTrieSet;

public class SmoothSlidingWindowsSpec {

  @Test
  public void createsCorrectSingletonState() {

    final SlidingInterval window = new SlidingInterval(3124L);
    final SmoothSlidingWindows<String> assigner = new SmoothSlidingWindows<>(
        window);

    final SingletonWindowStore<SlidingInterval> state = assigner.stateInitializer().apply(HashTrieSet.empty());
    Assert.assertEquals(state.openWindows(), Collections.singleton(window));
  }

  @Test
  public void assignsSingletonWindow() {
    final SlidingInterval window = new SlidingInterval(3124L);
    final SmoothSlidingWindows<String> assigner = new SmoothSlidingWindows<>(
        window);

    final SingletonWindowStore<SlidingInterval> state = assigner.stateInitializer().apply(HashTrieSet.empty());
    final TemporalWindowAssigner.Assignment<SlidingInterval, SingletonWindowStore<SlidingInterval>> assignment =
        assigner.windowsFor("name", 10000, state);

    Assert.assertEquals(assignment.updatedState().openWindows(), Collections.singleton(window));
    Assert.assertEquals(assignment.windows(), Collections.singleton(window));
  }

  @Test
  public void initializeEmptyState() {
    final SlidingInterval window = new SlidingInterval(3124L);
    final SmoothSlidingWindows<String> assigner = new SmoothSlidingWindows<>(
        window);

    final SingletonWindowStore<SlidingInterval> state = assigner.stateInitializer().apply(HashTrieSet.empty());

    Assert.assertEquals(state.openWindows(), HashTrieSet.of(window));
  }

  @Test
  public void initializeFromCorrectState() {
    final SlidingInterval window = new SlidingInterval(3124L);
    final SmoothSlidingWindows<String> assigner = new SmoothSlidingWindows<>(
        window);

    final SingletonWindowStore<SlidingInterval> state = assigner.stateInitializer().apply(HashTrieSet.of(window));

    Assert.assertEquals(state.openWindows(), HashTrieSet.of(window));
  }

  @Test(expectedExceptions = IllegalStateException.class)
  public void failsToRestoreInvalidState() {
    final SlidingInterval window = new SlidingInterval(3124L);
    final SmoothSlidingWindows<String> assigner = new SmoothSlidingWindows<>(
        window);

    assigner.stateInitializer().apply(
        HashTrieSet.of(window, new SlidingInterval(76L)));

  }

  @Test(expectedExceptions = IllegalStateException.class)
  public void failsToRestoreNonMatchingWindow() {
    final SlidingInterval window = new SlidingInterval(3124L);
    final SmoothSlidingWindows<String> assigner = new SmoothSlidingWindows<>(
        window);

    assigner.stateInitializer().apply(
        HashTrieSet.of(new SlidingInterval(77L)));

  }

}
