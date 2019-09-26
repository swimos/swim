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
import java.util.Arrays;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.streamlet.persistence.TrivialPersistenceProvider;
import swim.streamlet.persistence.ValuePersister;
import swim.structure.form.DurationForm;
import swim.util.Deferred;

public class VariableFlatMapConduitSpec extends ConnectorTest {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void emitOutputsOnVariableSchedule(final boolean withState) {
    final FakeSchedule schedule = new FakeSchedule();

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Duration> periodPersister = provider.forValue("state",
          new DurationForm(Duration.ofSeconds(2)));
      final VariableFlatMapConduit<Integer, Integer> conduit = new VariableFlatMapConduit<>(n -> Arrays.asList(n, n + 1),
          schedule, periodPersister);
      emitOutputsOnVariableSchedule(schedule, conduit);

      Assert.assertEquals(periodPersister.get(), Duration.ofSeconds(5));
    } else {
      final VariableFlatMapConduit<Integer, Integer> conduit = new VariableFlatMapConduit<>(n -> Arrays.asList(n, n + 1),
          schedule, Duration.ofSeconds(2));

      emitOutputsOnVariableSchedule(schedule, conduit);
    }
  }

  private void emitOutputsOnVariableSchedule(final FakeSchedule schedule, final VariableFlatMapConduit<Integer, Integer> conduit) {
    final ArrayList<Integer> results = new ArrayList<>(2);

    final Receptacle<Integer> receptacle = n -> results.add(n.get());

    conduit.subscribe(receptacle);

    Assert.assertTrue(schedule.getScheduled().isEmpty());
    conduit.first().notifyChange(Deferred.value(1));

    check(schedule, results, 2000, 1);

    Assert.assertEquals(schedule.getScheduled().size(), 0);

    results.clear();

    conduit.second().notifyChange(Deferred.value(Duration.ofSeconds(5)));
    conduit.first().notifyChange(Deferred.value(3));

    check(schedule, results, 5000, 3);
  }

  private void check(final FakeSchedule schedule, final ArrayList<Integer> results,
                     final long delay,
                     final int start) {
    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0).intValue(), start);

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(delay));
    schedule.runScheduled(delay);
    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(1).intValue(), start + 1);
  }

}
