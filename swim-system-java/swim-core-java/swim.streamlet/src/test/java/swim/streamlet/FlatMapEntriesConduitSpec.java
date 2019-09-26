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

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.HashTrieSet;
import swim.streamlet.ConnectorUtilities.ActionAccumulator;
import swim.streamlet.ConnectorUtilities.MapAction;
import swim.util.Pair;
import static swim.streamlet.ConnectorUtilities.update;

public class FlatMapEntriesConduitSpec extends ConnectorTest {

  @Test
  public void transformEntries() {
    final FlatMapEntriesConduit<Integer, Integer, Integer, Integer> conduit = new FlatMapEntriesConduit<>(
        FlatMapEntriesConduitSpec::nonTrivialFactors, k -> Collections.emptySet());

    final ArrayList<MapAction<Integer, Integer>> results =
        ConnectorUtilities.pushData(conduit, update(1, 6));

    Assert.assertEquals(results.size(), 2);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(2).get().intValue(), 1);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(2).get().intValue(), 1);
      Assert.assertEquals(m.get(3).get().intValue(), 1);
    });
  }

  @Test
  public void removeEntries() {
    final FlatMapEntriesConduit<Integer, Integer, Integer, Integer> conduit = new FlatMapEntriesConduit<>(
        FlatMapEntriesConduitSpec::id, FlatMapEntriesConduitSpec::lessThan);

    final ActionAccumulator<Integer, Integer> acc =
        new ActionAccumulator<>();

    ConnectorUtilities.pushData(conduit, acc.update(1, 6), acc.update(3, 4), acc.update(7, 7));

    final ArrayList<MapAction<Integer, Integer>> results =
        ConnectorUtilities.pushData(conduit, acc.remove(3));

    Assert.assertEquals(results.size(), 2);

    final HashSet<Integer> expectedRemovals = new HashSet<>();
    expectedRemovals.add(1);
    expectedRemovals.add(3);

    for (final MapAction<Integer, Integer> result : results) {
      expectRemoval(result, (k, m) -> {
        Assert.assertTrue(expectedRemovals.contains(k));
        Assert.assertEquals(m.size(), expectedRemovals.size());
        expectedRemovals.remove(k);
        Assert.assertEquals(m.get(7).get().intValue(), 7);
        for (final Integer remaining : expectedRemovals) {
          Assert.assertTrue(m.containsKey(remaining));
        }
      });
    }

  }

  public static Iterable<Pair<Integer, Integer>> id(final Integer key, final Integer value) {
    return Collections.singletonList(Pair.pair(key, value));
  }

  public static Iterable<Pair<Integer, Integer>> nonTrivialFactors(final Integer key, final Integer value) {
    final ArrayList<Pair<Integer, Integer>> out = new ArrayList<>();
    for (int i = 2; i < value; ++i) {
      if (value % i == 0) {
        out.add(Pair.pair(i, key));
      }
    }
    return out;
  }

  public static Set<Integer> lessThan(final Integer key) {
    HashTrieSet<Integer> toRemove = HashTrieSet.empty();
    for (int i = 0; i <= key; ++i) {
      toRemove = toRemove.added(i);
    }
    return toRemove;
  }

}
