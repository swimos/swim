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
import swim.streamlet.persistence.TrivialPersistenceProvider;
import swim.streamlet.persistence.ValuePersister;
import swim.structure.form.DurationForm;
import swim.util.Deferred;

public class VariablePeriodicConduitSpec extends ConnectorTest {

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
          new DurationForm(Duration.ofSeconds(5)));

      final VariablePeriodicConduit<String> conduit = new VariablePeriodicConduit<>(schedule,
          periodPersister, StreamInterpretation.DISCRETE);

      limitRateOfOutput(schedule, conduit);

      Assert.assertEquals(periodPersister.get(), Duration.ofSeconds(4));
    } else {
      final VariablePeriodicConduit<String> conduit = new VariablePeriodicConduit<>(schedule,
          Duration.ofSeconds(5), StreamInterpretation.DISCRETE);

      limitRateOfOutput(schedule, conduit);
    }
  }

  private void limitRateOfOutput(final FakeSchedule schedule,
                                 final VariablePeriodicConduit<String> conduit) {
    final ArrayList<String> results = new ArrayList<>();

    final Receptacle<String> receptacle = w -> results.add(w.get());
    conduit.subscribe(receptacle);

    Assert.assertTrue(schedule.getScheduled().isEmpty());

    conduit.first().notifyChange(Deferred.value("The"));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));
    conduit.first().notifyChange(Deferred.value("cat"));
    conduit.first().notifyChange(Deferred.value("sat"));

    Assert.assertTrue(results.isEmpty());

    schedule.runScheduled(5000L);

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0), "sat");

    conduit.second().notifyChange(Deferred.value(Duration.ofSeconds(4)));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(4000L));

    schedule.runScheduled(4000L);
    Assert.assertEquals(results.size(), 1);

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(4000L));

    conduit.first().notifyChange(Deferred.value("on"));
    conduit.first().notifyChange(Deferred.value("the"));
    conduit.first().notifyChange(Deferred.value("mat."));

    schedule.runScheduled(4000L);
    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(1), "mat.");
  }

  @Test(dataProvider = "withState")
  public void sampleFromInput(final boolean withState) {
    final FakeSchedule schedule = new FakeSchedule();
    if (withState) {

      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Duration> periodPersister = provider.forValue("period",
          new DurationForm(Duration.ofSeconds(5)));

      final VariablePeriodicConduit<String> conduit = new VariablePeriodicConduit<>(schedule,
          periodPersister, StreamInterpretation.CONTINUOUS);

      sampleFromInput(schedule, conduit);

      Assert.assertEquals(periodPersister.get(), Duration.ofSeconds(4));
    } else {
      final VariablePeriodicConduit<String> conduit = new VariablePeriodicConduit<>(schedule,
          Duration.ofSeconds(5), StreamInterpretation.CONTINUOUS);

      sampleFromInput(schedule, conduit);
    }

  }

  private void sampleFromInput(final FakeSchedule schedule,
                               final VariablePeriodicConduit<String> conduit) {
    final ArrayList<String> results = new ArrayList<>();

    final Receptacle<String> receptacle = w -> results.add(w.get());
    conduit.subscribe(receptacle);

    Assert.assertTrue(schedule.getScheduled().isEmpty());

    conduit.first().notifyChange(Deferred.value("The"));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));
    conduit.first().notifyChange(Deferred.value("cat"));
    conduit.first().notifyChange(Deferred.value("sat"));

    Assert.assertTrue(results.isEmpty());

    schedule.runScheduled(5000L);

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0), "sat");

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));

    schedule.runScheduled(5000L);
    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(1), "sat");

    conduit.second().notifyChange(Deferred.value(Duration.ofSeconds(4)));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(4000L));

    conduit.first().notifyChange(Deferred.value("on"));
    conduit.first().notifyChange(Deferred.value("the"));
    conduit.first().notifyChange(Deferred.value("mat."));

    schedule.runScheduled(4000L);
    Assert.assertEquals(results.size(), 3);
    Assert.assertEquals(results.get(2), "mat.");
  }

}
