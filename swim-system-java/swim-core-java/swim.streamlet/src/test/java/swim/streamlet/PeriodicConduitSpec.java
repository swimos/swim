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
import org.testng.annotations.Test;
import swim.util.Deferred;

public class PeriodicConduitSpec extends ConnectorTest {

  @Test
  public void limitRateOfOutput() {

    final FakeSchedule schedule = new FakeSchedule();

    final PeriodicConduit<String> conduit = new PeriodicConduit<>(schedule,
        Duration.ofSeconds(5), StreamInterpretation.DISCRETE);

    final ArrayList<String> results = new ArrayList<>();

    final Receptacle<String> receptacle = w -> results.add(w.get());
    conduit.subscribe(receptacle);

    Assert.assertTrue(schedule.getScheduled().isEmpty());

    conduit.notifyChange(Deferred.value("The"));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));
    conduit.notifyChange(Deferred.value("cat"));
    conduit.notifyChange(Deferred.value("sat"));

    Assert.assertTrue(results.isEmpty());

    schedule.runScheduled(5000L);

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0), "sat");

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));

    schedule.runScheduled(5000L);
    Assert.assertEquals(results.size(), 1);

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));

    conduit.notifyChange(Deferred.value("on"));
    conduit.notifyChange(Deferred.value("the"));
    conduit.notifyChange(Deferred.value("mat."));

    schedule.runScheduled(5000L);
    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(1), "mat.");
  }

  @Test
  public void sampleFromInput() {
    final FakeSchedule schedule = new FakeSchedule();

    final PeriodicConduit<String> conduit = new PeriodicConduit<>(schedule,
        Duration.ofSeconds(5), StreamInterpretation.CONTINUOUS);

    final ArrayList<String> results = new ArrayList<>();

    final Receptacle<String> receptacle = w -> results.add(w.get());
    conduit.subscribe(receptacle);

    Assert.assertTrue(schedule.getScheduled().isEmpty());

    conduit.notifyChange(Deferred.value("The"));

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));
    conduit.notifyChange(Deferred.value("cat"));
    conduit.notifyChange(Deferred.value("sat"));

    Assert.assertTrue(results.isEmpty());

    schedule.runScheduled(5000L);

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0), "sat");

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));

    schedule.runScheduled(5000L);
    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(1), "sat");

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(5000L));

    conduit.notifyChange(Deferred.value("on"));
    conduit.notifyChange(Deferred.value("the"));
    conduit.notifyChange(Deferred.value("mat."));

    schedule.runScheduled(5000L);
    Assert.assertEquals(results.size(), 3);
    Assert.assertEquals(results.get(2), "mat.");
  }
}
