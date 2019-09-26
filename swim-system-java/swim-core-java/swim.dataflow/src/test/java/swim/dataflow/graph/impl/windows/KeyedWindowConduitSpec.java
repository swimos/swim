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

import java.util.ArrayList;
import java.util.function.Consumer;
import java.util.function.Function;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.dataflow.graph.impl.ConnectorTest;
import swim.dataflow.graph.timestamps.TimestampAssigner;
import swim.streamlet.ConnectorUtilities;
import swim.streamlet.ConnectorUtilities.MapAction;
import swim.streamlet.MapReceptacle;
import swim.streamlet.MapView;
import swim.util.Deferred;
import swim.util.Pair;

public class KeyedWindowConduitSpec extends ConnectorTest {

  @Test
  public void handleUpdatesAndRemovals() {
    final ConnectorTest.FakeSchedule schedule = new ConnectorTest.FakeSchedule();
    final FakePaneManagers managers = new FakePaneManagers();

    final KeyedWindowConduit<String, Pair<Long, Integer>, Integer, Integer> conduit = new KeyedWindowConduit<>(
        schedule, managers, TimestampAssigner.fromData(Pair::getFirst));

    final ArrayList<MapAction<String, Integer>> outputs = createOutputCollector(conduit);

    final Pair<Long, Integer> in1 = Pair.pair(1000L, 15);
    final Pair<Long, Integer> in2 = Pair.pair(2000L, 15);

    managers.expect("a", new Expectation(in1,
        1000L, null, Pair.pair(6, 16)));
    managers.expect("b", new Expectation(in2,
        2000L, null, Pair.pair(8, 18)));

    final HashTrieMap<String, Pair<Long, Integer>> inMap = HashTrieMap.of("a", in1);

    //Push values for two different keys and then remove the first.
    conduit.notifyChange("a", Deferred.value(in1), Deferred.value(MapView.wrap(inMap)));
    conduit.notifyChange("b", Deferred.value(in2), Deferred.value(MapView.wrap(inMap.updated("b", in2))));
    conduit.notifyRemoval("a", Deferred.value(MapView.wrap(HashTrieMap.of("b", in2))));

    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertEquals(outputs.size(), 3);

    //Check we get the expected updates and removals.
    expectUpdate(outputs.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 16);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 16);
    });

    expectUpdate(outputs.get(1), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 18);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 16);
      Assert.assertEquals(m.get("b").get().intValue(), 18);
    });

    expectRemoval(outputs.get(2), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("b").get().intValue(), 18);
    });

    final HashTrieMap<String, FingerTrieSeq<FakePaneManager>> closed = managers.closed;
    Assert.assertEquals(closed.keySet(), HashTrieSet.of("a"));
    final FingerTrieSeq<FakePaneManager> forA = closed.get("a");
    Assert.assertNotNull(forA);
    Assert.assertEquals(forA.size(), 1);
  }

  @Test
  public void replacePaneManagerOnRemoval() {
    final ConnectorTest.FakeSchedule schedule = new ConnectorTest.FakeSchedule();
    final FakePaneManagers managers = new FakePaneManagers();

    final KeyedWindowConduit<String, Pair<Long, Integer>, Integer, Integer> conduit = new KeyedWindowConduit<>(
        schedule, managers, TimestampAssigner.fromData(Pair::getFirst));

    final ArrayList<MapAction<String, Integer>> outputs = createOutputCollector(conduit);

    final Pair<Long, Integer> in1 = Pair.pair(1000L, 15);
    final Pair<Long, Integer> in2 = Pair.pair(2000L, 15);

    managers.expect("a", new Expectation(in1,
        1000L, null, Pair.pair(6, 16)));

    //Push values for two different keys and then remove the first.
    conduit.notifyChange("a", Deferred.value(in1), Deferred.value(MapView.wrap(HashTrieMap.of("a", in1))));
    conduit.notifyRemoval("a", Deferred.value(MapView.wrapSimple(HashTrieMap.empty())));

    final HashTrieMap<String, FingerTrieSeq<FakePaneManager>> closed1 = managers.closed;
    Assert.assertEquals(closed1.keySet(), HashTrieSet.of("a"));
    final FingerTrieSeq<FakePaneManager> forA1 = closed1.get("a");
    Assert.assertNotNull(forA1);
    Assert.assertEquals(forA1.size(), 1);

    managers.expect("a", new Expectation(in2,
        2000L, null, Pair.pair(8, 18)));

    conduit.notifyChange("a", Deferred.value(in2), Deferred.value(MapView.wrap(HashTrieMap.of("a", in2))));
    conduit.notifyRemoval("a", Deferred.value(MapView.wrapSimple(HashTrieMap.empty())));

    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertEquals(outputs.size(), 4);

    //Check we get the expected updates and removals.
    expectUpdate(outputs.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 16);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 16);
    });

    expectRemoval(outputs.get(1), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });

    expectUpdate(outputs.get(2), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 18);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 18);
    });

    expectRemoval(outputs.get(3), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });

    final HashTrieMap<String, FingerTrieSeq<FakePaneManager>> closed2 = managers.closed;
    Assert.assertEquals(closed2.keySet(), HashTrieSet.of("a"));
    final FingerTrieSeq<FakePaneManager> forA2 = closed2.get("a");
    Assert.assertNotNull(forA2);
    Assert.assertEquals(forA2.size(), 2);
  }

  @Test
  public void triggerByDataTimestampsForOneKey() {
    final ConnectorTest.FakeSchedule schedule = new ConnectorTest.FakeSchedule();
    final FakePaneManagers managers = new FakePaneManagers();

    final KeyedWindowConduit<String, Pair<Long, Integer>, Integer, Integer> conduit = new KeyedWindowConduit<>(
        schedule, managers, TimestampAssigner.fromData(Pair::getFirst));

    final ArrayList<MapAction<String, Integer>> outputs = createOutputCollector(conduit);
    final ArrayList<Pair<Long, Long>> executedCallbacks = new ArrayList<>();

    final Pair<Long, Integer> in1 = Pair.pair(1000L, 15);
    final Pair<Long, Integer> in2 = Pair.pair(2000L, 15);

    final PaneManager.WindowCallback cb = (requested, actual) -> executedCallbacks.add(Pair.pair(requested, actual));

    //Request a callback in the future.
    managers.expect("a", new Expectation(in1,
        1000L, Pair.pair(1500L, cb), null));

    final HashTrieMap<String, Pair<Long, Integer>> inMap = HashTrieMap.of("a", in1);

    conduit.notifyChange("a", Deferred.value(in1), Deferred.value(MapView.wrap(inMap)));

    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertTrue(outputs.isEmpty());
    Assert.assertTrue(executedCallbacks.isEmpty());

    managers.expect("a", new Expectation(in2,
        2000L, null, null));

    //Push another value for the same key at a time after the callback time.
    conduit.notifyChange("a", Deferred.value(in2), Deferred.value(MapView.wrap(inMap.updated("a", in2))));
    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertTrue(outputs.isEmpty());

    //Check that the callback was received.
    Assert.assertEquals(executedCallbacks.size(), 1);
    Assert.assertEquals(executedCallbacks.get(0), Pair.pair(1500L, 2000L));

    Assert.assertTrue(managers.closed.isEmpty());
  }

  @Test
  public void triggerByDataTimestampsBetweenKeys() {
    final ConnectorTest.FakeSchedule schedule = new ConnectorTest.FakeSchedule();
    final FakePaneManagers managers = new FakePaneManagers();

    final KeyedWindowConduit<String, Pair<Long, Integer>, Integer, Integer> conduit = new KeyedWindowConduit<>(
        schedule, managers, TimestampAssigner.fromData(Pair::getFirst));

    final ArrayList<MapAction<String, Integer>> outputs = createOutputCollector(conduit);
    final ArrayList<Pair<Long, Long>> executedCallbacks = new ArrayList<>();

    final Pair<Long, Integer> in1 = Pair.pair(1000L, 15);
    final Pair<Long, Integer> in2 = Pair.pair(2000L, 15);


    final PaneManager.WindowCallback cb = (requested, actual) -> executedCallbacks.add(Pair.pair(requested, actual));

    //Request a callback in the future.
    managers.expect("a", new Expectation(in1,
        1000L, Pair.pair(1500L, cb), null));

    final HashTrieMap<String, Pair<Long, Integer>> inMap = HashTrieMap.of("a", in1);

    conduit.notifyChange("a", Deferred.value(in1), Deferred.value(MapView.wrap(inMap)));

    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertTrue(outputs.isEmpty());
    Assert.assertTrue(executedCallbacks.isEmpty());

    managers.expect("b", new Expectation(in2,
        2000L, null, null));

    //Push a value, for another key, a time after the scheduled callback.
    conduit.notifyChange("b", Deferred.value(in2), Deferred.value(MapView.wrap(inMap.updated("b", in2))));
    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertTrue(outputs.isEmpty());

    //Verify that the callback occurred on the original key.
    Assert.assertEquals(executedCallbacks.size(), 1);
    Assert.assertEquals(executedCallbacks.get(0), Pair.pair(1500L, 2000L));

    Assert.assertTrue(managers.closed.isEmpty());
  }

  @Test
  public void scheduleCallbacksUsingClockTimestamps() {
    final ConnectorTest.FakeSchedule schedule = new ConnectorTest.FakeSchedule();
    final FakePaneManagers managers = new FakePaneManagers();
    final FakeClock clock = new FakeClock();

    final KeyedWindowConduit<String, Pair<Long, Integer>, Integer, Integer> conduit = new KeyedWindowConduit<>(
        schedule, managers, clock);

    final ArrayList<MapAction<String, Integer>> outputs = createOutputCollector(conduit);
    final ArrayList<Pair<Long, Long>> executedCallbacks = new ArrayList<>();

    final Pair<Long, Integer> in1 = Pair.pair(1000L, 15);

    final PaneManager.WindowCallback cb = (requested, actual) -> executedCallbacks.add(Pair.pair(requested, actual));

    //Schedule a callback in the future.
    managers.expect("a", new Expectation(in1,
        1000L, Pair.pair(1500L, cb), null));

    final HashTrieMap<String, Pair<Long, Integer>> inMap = HashTrieMap.of("a", in1);

    conduit.notifyChange("a", Deferred.value(in1), Deferred.value(MapView.wrap(inMap)));

    //Check that the callback has been registered with the scheduler.
    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(500L));
    Assert.assertTrue(outputs.isEmpty());
    Assert.assertTrue(executedCallbacks.isEmpty());

    //Trigger the callback.
    clock.advance(1600L);
    schedule.runScheduled(500L);

    //Verify that the callback was received.
    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertEquals(executedCallbacks.size(), 1);
    Assert.assertEquals(executedCallbacks.get(0), Pair.pair(1500L, 1600L));

    Assert.assertTrue(managers.closed.isEmpty());

  }

  private static ArrayList<MapAction<String, Integer>> createOutputCollector(
      final KeyedWindowConduit<String, Pair<Long, Integer>, Integer, Integer> conduit) {
    final ArrayList<MapAction<String, Integer>> outputs = new ArrayList<>();

    conduit.subscribe(new MapReceptacle<String, Integer>() {
      @Override
      public void notifyChange(final String key, final Deferred<Integer> value, final Deferred<MapView<String, Integer>> map) {
        outputs.add(ConnectorUtilities.update(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final String key, final Deferred<MapView<String, Integer>> map) {
        outputs.add(ConnectorUtilities.remove(key, map.get()));
      }
    });
    return outputs;
  }

  /**
   * Factory for fake pane managers that allows expectations to be injected per key.
   */
  private static final class FakePaneManagers implements Function<String, PaneManager<Pair<Long, Integer>, Integer, Integer>> {

    private HashTrieMap<String, FakePaneManager> managers = HashTrieMap.empty();
    private HashTrieMap<String, FingerTrieSeq<FakePaneManager>> closed = HashTrieMap.empty();

    @Override
    public PaneManager<Pair<Long, Integer>, Integer, Integer> apply(final String s) {
      return get(s);
    }

    private FakePaneManager get(final String s) {
      if (!managers.containsKey(s)) {
        final Consumer<FakePaneManager> onClose = manager -> {
          managers = managers.removed(s);
          final FingerTrieSeq<FakePaneManager> seq = closed.getOrDefault(s, FingerTrieSeq.empty());
          closed = closed.updated(s, seq.appended(manager));
        };
        managers = managers.updated(s, new FakePaneManager(onClose));
      }
      return managers.get(s);
    }

    void expect(final String key, final Expectation exp) {
      get(key).expect(exp);
    }
  }

}
