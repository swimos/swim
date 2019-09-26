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
import java.util.function.Function;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.streamlet.ConnectorUtilities.MapAction;
import swim.streamlet.persistence.ListPersister;
import swim.streamlet.persistence.SetPersister;
import swim.streamlet.persistence.TrivialPersistenceProvider.TrivialListPersister;
import swim.streamlet.persistence.TrivialPersistenceProvider.TrivialSetPersisiter;
import static swim.streamlet.ConnectorUtilities.remove;
import static swim.streamlet.ConnectorUtilities.update;

public class DelayMapConduitSpec extends ConnectorTest {

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForZeroDelay() {
    new DelayMapConduit<>(0);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForNegativeDelay() {
    new DelayMapConduit<>(-1);
  }

  @Test
  public void emitsNothingOnIntialInput() {
    final DelayMapConduit<String, Integer> conduit = new DelayMapConduit<>(1);
    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(conduit, update("a", 3));
    Assert.assertTrue(results.isEmpty());
  }

  @Test
  public void emitsPreviousValuesForAKey() {
    final DelayMapConduit<String, Integer> conduit = new DelayMapConduit<>(1);
    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(conduit, update("a", 3), update("a", 5));

    Assert.assertEquals(results.size(), 1);
    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 3);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
    });
  }

  @Test
  public void emitsWithLongerDelay() {
    final DelayMapConduit<String, Integer> conduit = new DelayMapConduit<>(3);

    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(
        conduit, update("a", 3), update("a", 5), update("a", -4));
    Assert.assertTrue(results.isEmpty());

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorUtilities.pushData(
        conduit, update("a", 10));

    Assert.assertEquals(results2.size(), 1);

    expectUpdate(results2.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 3);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
    });
  }

  @Test
  public void ignoresOtherKeysWithUnderfullBuffers() {
    final DelayMapConduit<String, Integer> conduit = new DelayMapConduit<>(1);
    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(conduit,
        update("a", 3), update("b", -2), update("b", 4));

    Assert.assertEquals(results.size(), 1);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), -2);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("b").get().intValue(), -2);
    });
  }

  @Test
  public void remembersPreviousKeys() {
    final DelayMapConduit<String, Integer> conduit = new DelayMapConduit<>(1);
    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(conduit,
        update("a", 3), update("b", -2), update("a", 12), update("b", 4));

    Assert.assertEquals(results.size(), 2);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 3);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), -2);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
      Assert.assertEquals(m.get("b").get().intValue(), -2);
    });
  }

  @Test
  public void restoreFromState() {
    final SetPersister<String> keys = new TrivialSetPersisiter<>();
    keys.add("a");
    keys.add("b");

    final HashTrieMap<String, ListPersister<Integer>> buffers = HashTrieMap.<String, ListPersister<Integer>>empty()
        .updated("a", new TrivialListPersister<>())
        .updated("b", new TrivialListPersister<>());

    final ListPersister<Integer> forA = buffers.get("a");
    final ListPersister<Integer> forB = buffers.get("b");
    Assert.assertNotNull(forA);
    Assert.assertNotNull(forB);
    forA.append(1);
    forA.append(2);
    forB.append(-1);

    final DelayMapConduit<String, Integer> conduit = new DelayMapConduit<>(buffers::get, keys, 1);

    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(conduit, update("b", 7));

    Assert.assertEquals(results.size(), 1);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), -1);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
      Assert.assertEquals(m.get("b").get().intValue(), -1);
    });
  }

  private static final class BufferFactory implements Function<String, ListPersister<Integer>> {
    HashTrieMap<String, ListPersister<Integer>> persisters = HashTrieMap.empty();

    @Override
    public ListPersister<Integer> apply(final String s) {
      final ListPersister<Integer> existing = persisters.get(s);
      if (existing != null) {
        return existing;
      } else {
        final TrivialListPersister<Integer> fresh = new TrivialListPersister<>();
        persisters = persisters.updated(s, fresh);
        return fresh;
      }
    }
  }

  @Test
  public void storeKeysAndBuffersInState() {
    final SetPersister<String> keys = new TrivialSetPersisiter<>();
    final BufferFactory fac = new BufferFactory();
    final DelayMapConduit<String, Integer> conduit = new DelayMapConduit<>(fac, keys, 1);

    ConnectorUtilities.pushData(conduit, update("a", 1), update("b", 2), update("b", 3), update("b", 4));

    Assert.assertEquals(keys.get(), HashTrieSet.of("a", "b"));

    final HashTrieMap<String, ListPersister<Integer>> buffers = fac.persisters;

    Assert.assertEquals(buffers.keySet(), keys.get());

    final ListPersister<Integer> forA = buffers.get("a");
    Assert.assertNotNull(forA);
    Assert.assertEquals(forA.size(), 1);
    Assert.assertEquals(forA.get(0).intValue(), 1);

    final ListPersister<Integer> forB = buffers.get("b");
    Assert.assertNotNull(forB);
    Assert.assertEquals(forB.size(), 2);
    Assert.assertEquals(forB.get(0).intValue(), 3);
    Assert.assertEquals(forB.get(1).intValue(), 4);
  }

  @Test
  public void removalResetsBuffers() {
    final DelayMapConduit<String, Integer> conduit = new DelayMapConduit<>(1);
    ConnectorUtilities.pushData(
        conduit, update("a", 3), update("a", 5));

    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(
        conduit, remove("a"), update("a", 7));

    Assert.assertEquals(results.size(), 1);

    expectRemoval(results.get(0), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });
  }
}
