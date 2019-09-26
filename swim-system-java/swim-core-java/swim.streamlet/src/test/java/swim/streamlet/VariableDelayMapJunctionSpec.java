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
import swim.streaming.persistence.ListPersister;
import swim.streaming.persistence.SetPersister;
import swim.streaming.persistence.TrivialPersistenceProvider;
import swim.streaming.persistence.TrivialPersistenceProvider.TrivialValuePersister;
import swim.streamlet.ConnectorUtilities.MapAction;
import swim.util.Either;
import static swim.streamlet.ConnectorUtilities.remove;
import static swim.streamlet.ConnectorUtilities.update;

public class VariableDelayMapJunctionSpec extends ConnectorTest {

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForZeroDelay() {
    new VariableDelayMapJunction<>(0);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForNegativeDelay() {
    new VariableDelayMapJunction<>(-1);
  }

  @Test
  public void emitsNothingOnIntialInput() {
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(1);
    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(
        junction, Either.left(update("a", 3)));
    Assert.assertTrue(results.isEmpty());
  }

  @Test
  public void emitsPreviousValuesForAKey() {
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(1);
    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(
        junction, Either.left(update("a", 3)), Either.left(update("a", 5)));

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
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(3);

    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(
        junction, Either.left(update("a", 3)), Either.left(update("a", 5)), Either.left(update("a", -4)));
    Assert.assertTrue(results.isEmpty());

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorUtilities.pushData(
        junction, Either.left(update("a", 10)));

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
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(1);
    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(junction,
        Either.left(update("a", 3)), Either.left(update("b", -2)), Either.left(update("b", 4)));

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
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(1);
    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(junction,
        Either.left(update("a", 3)), Either.left(update("b", -2)), Either.left(update("a", 12)), Either.left(update("b", 4)));

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
    final SetPersister<String> keys = new TrivialPersistenceProvider.TrivialSetPersisiter<>();
    keys.add("a");
    keys.add("b");

    final HashTrieMap<String, ListPersister<Integer>> buffers = HashTrieMap.<String, ListPersister<Integer>>empty()
        .updated("a", new TrivialPersistenceProvider.TrivialListPersister<>())
        .updated("b", new TrivialPersistenceProvider.TrivialListPersister<>());

    final ListPersister<Integer> forA = buffers.get("a");
    final ListPersister<Integer> forB = buffers.get("b");
    Assert.assertNotNull(forA);
    Assert.assertNotNull(forB);
    forA.append(1);
    forA.append(2);
    forB.append(-1);

    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(
        buffers::get, keys, new TrivialValuePersister<>(1));

    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(
        junction, Either.left(update("b", 7)));

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
        final TrivialPersistenceProvider.TrivialListPersister<Integer> fresh = new TrivialPersistenceProvider.TrivialListPersister<>();
        persisters = persisters.updated(s, fresh);
        return fresh;
      }
    }
  }

  @Test
  public void storeKeysAndBuffersInState() {
    final SetPersister<String> keys = new TrivialPersistenceProvider.TrivialSetPersisiter<>();
    final VariableDelayMapJunctionSpec.BufferFactory fac = new VariableDelayMapJunctionSpec.BufferFactory();
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(
        fac, keys, new TrivialValuePersister<>(1));

    ConnectorUtilities.pushData(junction,
        Either.left(update("a", 1)), Either.left(update("b", 2)), Either.left(update("b", 3)), Either.left(update("b", 4)));

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
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(1);
    ConnectorUtilities.pushData(
        junction, Either.left(update("a", 3)), Either.left(update("a", 5)));

    final ArrayList<MapAction<String, Integer>> results = ConnectorUtilities.pushData(
        junction, Either.left(remove("a")), Either.left(update("a", 7)));

    Assert.assertEquals(results.size(), 1);

    expectRemoval(results.get(0), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });
  }

  @Test
  public void handleReductionInBufferSize() {
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(3);
    final ArrayList<MapAction<String, Integer>> results1 = ConnectorUtilities.pushData(
        junction, Either.left(update("a", 1)), Either.left(update("a", 2)), Either.left(update("a", 3)), Either.left(update("a", 4)));

    Assert.assertEquals(results1.size(), 1);
    expectUpdate(results1.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
    });

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorUtilities.pushData(junction, Either.right(1));

    Assert.assertTrue(results2.isEmpty());

    final ArrayList<MapAction<String, Integer>> results3 = ConnectorUtilities.pushData(junction, Either.left(update("a", 5)));

    Assert.assertEquals(results3.size(), 1);
    expectUpdate(results3.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 4);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 4);
    });
  }

  @Test
  public void handleIncreaseInBufferSize() {
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(2);
    final ArrayList<MapAction<String, Integer>> results1 = ConnectorUtilities.pushData(
        junction, Either.left(update("a", 1)), Either.left(update("a", 2)));

    Assert.assertTrue(results1.isEmpty());

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorUtilities.pushData(junction, Either.right(3));

    Assert.assertTrue(results2.isEmpty());

    final ArrayList<MapAction<String, Integer>> results3 = ConnectorUtilities.pushData(junction, Either.left(update("a", 3)));

    Assert.assertTrue(results3.isEmpty());

    final ArrayList<MapAction<String, Integer>> results4 = ConnectorUtilities.pushData(junction, Either.left(update("a", 4)));

    Assert.assertEquals(results4.size(), 1);

    expectUpdate(results3.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
    });
  }

  @Test
  public void storesDelayInState() {
    final SetPersister<String> keys = new TrivialPersistenceProvider.TrivialSetPersisiter<>();
    final VariableDelayMapJunctionSpec.BufferFactory fac = new VariableDelayMapJunctionSpec.BufferFactory();
    final TrivialValuePersister<Integer> delayState = new TrivialValuePersister<>(2);
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(
        fac, keys, delayState);

    ConnectorUtilities.pushData(junction, Either.right(3));

    Assert.assertEquals(delayState.get().intValue(), 3);
  }

  @Test
  public void ignoresInvalidDelays() {
    final SetPersister<String> keys = new TrivialPersistenceProvider.TrivialSetPersisiter<>();
    final VariableDelayMapJunctionSpec.BufferFactory fac = new VariableDelayMapJunctionSpec.BufferFactory();
    final TrivialValuePersister<Integer> delayState = new TrivialValuePersister<>(2);
    final VariableDelayMapJunction<String, Integer> junction = new VariableDelayMapJunction<>(
        fac, keys, delayState);


    final ArrayList<MapAction<String, Integer>> results1 = ConnectorUtilities.pushData(
        junction, Either.left(update("a", 1)), Either.left(update("a", 2)));

    Assert.assertTrue(results1.isEmpty());

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorUtilities.pushData(junction, Either.right(-1));

    Assert.assertTrue(results2.isEmpty());

    final ArrayList<MapAction<String, Integer>> results3 = ConnectorUtilities.pushData(junction, Either.left(update("a", 3)));

    Assert.assertEquals(results3.size(), 1);
    expectUpdate(results3.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
    });

    Assert.assertEquals(delayState.get().intValue(), 2);
  }
}
