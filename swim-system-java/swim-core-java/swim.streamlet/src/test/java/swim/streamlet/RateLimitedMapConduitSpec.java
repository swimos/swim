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

import java.time.Duration;
import java.util.ArrayList;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.collections.HashTrieMap;
import swim.streaming.MapReceptacle;
import swim.streaming.MapView;
import swim.streaming.persistence.TrivialPersistenceProvider;
import swim.streaming.persistence.ValuePersister;
import swim.streamlet.ConnectorUtilities.MapAction;
import swim.streamlet.ConnectorUtilities.Remove;
import swim.streamlet.ConnectorUtilities.Update;
import swim.structure.form.DurationForm;
import swim.util.Deferred;

public class RateLimitedMapConduitSpec extends ConnectorTest {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void limitRateOfOutput(final boolean withState) {
    final FakeSchedule schedule = new FakeSchedule();
    if (withState) {

      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Duration> periodPersister = provider.forValue("period",
          new DurationForm(Duration.ofSeconds(2)));

      final RateLimitedMapConduit<String, Integer> conduit = new RateLimitedMapConduit<>(
          schedule, periodPersister);

      limitRateOfOutput(schedule, conduit);

      Assert.assertEquals(periodPersister.get(), Duration.ofSeconds(2));
    } else {
      final RateLimitedMapConduit<String, Integer> conduit = new RateLimitedMapConduit<>(
          schedule, Duration.ofSeconds(2));

      limitRateOfOutput(schedule, conduit);
    }
  }

  private void limitRateOfOutput(final FakeSchedule schedule,
                                 final RateLimitedMapConduit<String, Integer> conduit) {
    final ArrayList<MapAction<String, Integer>> outputs = new ArrayList<>();
    final MapReceptacle<String, Integer> receptacle = new MapReceptacle<String, Integer>() {
      @Override
      public void notifyChange(final String key, final Deferred<Integer> value,
                               final Deferred<MapView<String, Integer>> map) {
        outputs.add(new Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final String key, final Deferred<MapView<String, Integer>> map) {
        outputs.add(new Remove<>(key, map.get()));
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
    state = state.updated("a", 3);
    conduit.first().notifyChange("a", Deferred.value(3), Deferred.value(MapView.wrap(state)));
    state = state.removed("b");
    conduit.first().notifyRemoval("b", Deferred.value(MapView.wrap(state)));

    Assert.assertEquals(0, outputs.size());

    schedule.runScheduled(2000L);

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(2000L));

    Assert.assertEquals(outputs.size(), 1);

    expectUpdate(outputs.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 3);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
    });

    outputs.clear();

    state = state.removed("a");
    conduit.first().notifyRemoval("a", Deferred.value(MapView.wrap(state)));

    Assert.assertEquals(0, outputs.size());

    schedule.runScheduled(2000L);

    Assert.assertEquals(outputs.size(), 1);

    expectRemoval(outputs.get(0), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });
  }

  @Test(dataProvider = "withState")
  public void changeOutputPeriod(final boolean withState) {
    final FakeSchedule schedule = new FakeSchedule();
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Duration> periodPersister = provider.forValue("period",
          new DurationForm(Duration.ofSeconds(2)));

      final RateLimitedMapConduit<String, Integer> conduit = new RateLimitedMapConduit<>(
          schedule, periodPersister);

      changeOutputPeriod(schedule, conduit);

      Assert.assertEquals(periodPersister.get(), Duration.ofSeconds(1));
    } else {
      final RateLimitedMapConduit<String, Integer> conduit = new RateLimitedMapConduit<>(
          schedule, Duration.ofSeconds(2));

      changeOutputPeriod(schedule, conduit);
    }
  }

  private void changeOutputPeriod(final FakeSchedule schedule,
                                  final RateLimitedMapConduit<String, Integer> conduit) {
    final ArrayList<MapAction<String, Integer>> outputs = new ArrayList<>();
    final MapReceptacle<String, Integer> receptacle = new MapReceptacle<String, Integer>() {
      @Override
      public void notifyChange(final String key, final Deferred<Integer> value,
                               final Deferred<MapView<String, Integer>> map) {
        outputs.add(new Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final String key, final Deferred<MapView<String, Integer>> map) {
        outputs.add(new Remove<>(key, map.get()));
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

    expectUpdate(outputs.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
    });

    outputs.clear();

    conduit.second().notifyChange(Deferred.value(Duration.ofSeconds(1)));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(1000L));

    Assert.assertEquals(0, outputs.size());

    state = state.removed("a");
    conduit.first().notifyRemoval("a", Deferred.value(MapView.wrap(state)));

    Assert.assertEquals(0, outputs.size());

    schedule.runScheduled(1000L);

    Assert.assertEquals(outputs.size(), 1);

    expectRemoval(outputs.get(0), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });
  }

}
