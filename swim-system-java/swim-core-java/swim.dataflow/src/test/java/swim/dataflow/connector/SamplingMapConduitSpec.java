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

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.collections.HashTrieMap;
import swim.dataflow.connector.ConnectorTestUtil.MapAction;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.structure.form.DurationForm;

public class SamplingMapConduitSpec {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void sampleFromOutput(final boolean withState) {
    final ConnectorTestUtil.FakeSchedule schedule = new ConnectorTestUtil.FakeSchedule();
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Duration> periodPersister = provider.forValue("period",
          new DurationForm(Duration.ofSeconds(2)));

      final SamplingMapConduit<String, Integer> conduit = new SamplingMapConduit<>(
          schedule, periodPersister);

      sampleFromOutput(schedule, conduit);

      Assert.assertEquals(periodPersister.get(), Duration.ofSeconds(2));
    } else {
      final SamplingMapConduit<String, Integer> conduit = new SamplingMapConduit<>(
          schedule, Duration.ofSeconds(2));

      sampleFromOutput(schedule, conduit);
    }
  }

  private void sampleFromOutput(final ConnectorTestUtil.FakeSchedule schedule, final SamplingMapConduit<String, Integer> conduit) {
    final ArrayList<MapAction<String, Integer>> outputs = new ArrayList<>();
    final MapReceptacle<String, Integer> receptacle = new MapReceptacle<String, Integer>() {
      @Override
      public void notifyChange(final String key, final Deferred<Integer> value, final Deferred<MapView<String, Integer>> map) {
        outputs.add(new ConnectorTestUtil.Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final String key, final Deferred<MapView<String, Integer>> map) {
        outputs.add(new ConnectorTestUtil.Remove<>(key, map.get()));
      }
    };

    conduit.subscribe(receptacle);
    Assert.assertTrue(schedule.getScheduled().isEmpty());

    HashTrieMap<String, Integer> state = HashTrieMap.<String, Integer>empty().updated("a", 1);
    conduit.first().notifyChange("a", Deferred.value(1), Deferred.value(MapView.wrap(state)));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(2000L));

    state = state.updated("b", 2);
    conduit.first().notifyChange("b", Deferred.value(2), Deferred.value(MapView.wrap(state)));


    Assert.assertEquals(0, outputs.size());

    schedule.runScheduled(2000L);

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(2000L));

    Assert.assertEquals(outputs.size(), 2);

    ConnectorTestUtil.expectUpdate(outputs.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
      Assert.assertEquals(m.get("b").get().intValue(), 2);
    });

    ConnectorTestUtil.expectUpdate(outputs.get(1), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 2);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
      Assert.assertEquals(m.get("b").get().intValue(), 2);
    });

    outputs.clear();

    state = state.removed("a");
    conduit.first().notifyRemoval("a", Deferred.value(MapView.wrap(state)));

    Assert.assertEquals(0, outputs.size());

    schedule.runScheduled(2000L);

    Assert.assertEquals(outputs.size(), 2);

    for (final MapAction<String, Integer> action : outputs) {
      action.push(new MapReceptacle<String, Integer>() {
        @Override
        public void notifyChange(final String key, final Deferred<Integer> value, final Deferred<MapView<String, Integer>> map) {
          Assert.assertEquals(key, "b");
          Assert.assertEquals(value.get().intValue(), 2);
          final MapView<String, Integer> view = map.get();
          Assert.assertEquals(view.size(), 1);
          Assert.assertEquals(view.get("b").get().intValue(), 2);
        }

        @Override
        public void notifyRemoval(final String key, final Deferred<MapView<String, Integer>> map) {
          Assert.assertEquals(key, "a");
          final MapView<String, Integer> view = map.get();
          Assert.assertEquals(view.size(), 1);
          Assert.assertEquals(view.get("b").get().intValue(), 2);
        }
      });
    }
  }

  @Test(dataProvider = "withState")
  public void changeOutputPeriod(final boolean withState) {
    final ConnectorTestUtil.FakeSchedule schedule = new ConnectorTestUtil.FakeSchedule();
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Duration> periodPersister = provider.forValue("period",
          new DurationForm(Duration.ofSeconds(2)));

      final SamplingMapConduit<String, Integer> conduit = new SamplingMapConduit<>(
          schedule, periodPersister);

      changeOutputPeriod(schedule, conduit);

      Assert.assertEquals(periodPersister.get(), Duration.ofSeconds(10));
    } else {
      final SamplingMapConduit<String, Integer> conduit = new SamplingMapConduit<>(
          schedule, Duration.ofSeconds(2));

      changeOutputPeriod(schedule, conduit);
    }

  }

  private void changeOutputPeriod(final ConnectorTestUtil.FakeSchedule schedule,
                                  final SamplingMapConduit<String, Integer> conduit) {
    final ArrayList<MapAction<String, Integer>> outputs = new ArrayList<>();
    final MapReceptacle<String, Integer> receptacle = new MapReceptacle<String, Integer>() {
      @Override
      public void notifyChange(final String key, final Deferred<Integer> value, final Deferred<MapView<String, Integer>> map) {
        outputs.add(new ConnectorTestUtil.Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final String key, final Deferred<MapView<String, Integer>> map) {
        outputs.add(new ConnectorTestUtil.Remove<>(key, map.get()));
      }
    };

    conduit.subscribe(receptacle);
    Assert.assertTrue(schedule.getScheduled().isEmpty());

    HashTrieMap<String, Integer> state = HashTrieMap.<String, Integer>empty().updated("a", 1);
    conduit.first().notifyChange("a", Deferred.value(1), Deferred.value(MapView.wrap(state)));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(2000L));

    Assert.assertEquals(0, outputs.size());

    schedule.runScheduled(2000L);

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(2000L));

    Assert.assertEquals(outputs.size(), 1);

    ConnectorTestUtil.expectUpdate(outputs.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
    });

    outputs.clear();

    conduit.second().notifyChange(Deferred.value(Duration.ofSeconds(10)));
    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(10000L));

    state = state.updated("b", 2);
    conduit.first().notifyChange("b", Deferred.value(2), Deferred.value(MapView.wrap(state)));

    Assert.assertEquals(outputs.size(), 0);

    schedule.runScheduled(10000);

    Assert.assertEquals(outputs.size(), 2);

    final HashSet<String> expectedKeys = new HashSet<>();
    expectedKeys.add("a");
    expectedKeys.add("b");

    for (final MapAction<String, Integer> action : outputs) {
      ConnectorTestUtil.expectUpdate(action, (k, v, m) -> {
        Assert.assertTrue(expectedKeys.contains(k));
        expectedKeys.remove(k);
        Assert.assertEquals(m.size(), 2);
        Assert.assertEquals(m.get("a").get().intValue(), 1);
        Assert.assertEquals(m.get("b").get().intValue(), 2);
      });
    }
  }
}
