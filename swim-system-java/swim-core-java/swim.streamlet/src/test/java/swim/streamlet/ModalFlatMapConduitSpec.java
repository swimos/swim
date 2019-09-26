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
import swim.streaming.Receptacle;
import swim.streaming.persistence.TrivialPersistenceProvider;
import swim.streaming.persistence.ValuePersister;
import swim.structure.Form;
import swim.structure.form.DurationForm;
import swim.util.Deferred;


public class ModalFlatMapConduitSpec extends ConnectorTest {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void emitOutputsOnVariableSchedule(final boolean withState) {
    final FakeSchedule schedule = new FakeSchedule();

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

      final ValuePersister<Parity> modePersister = provider.forValue("mode",
          Form.forEnum(Parity.class), Parity.ODD);

      final ValuePersister<Duration> durationPersister = provider.forValue("period",
          new DurationForm(Duration.ofSeconds(2)));

      final ModalFlatMapConduit<Integer, Integer, Parity> conduit = new ModalFlatMapConduit<>(
          modePersister,
          (Parity p) -> (Integer n) -> Arrays.asList(n, n + (p == Parity.ODD ? 1 : 2)),
          schedule, durationPersister);

      emitOutputOnVariableSchedule(schedule, conduit);

      Assert.assertEquals(modePersister.get(), Parity.EVEN);
      Assert.assertEquals(durationPersister.get(), Duration.ofSeconds(5));
    } else {
      final ModalFlatMapConduit<Integer, Integer, Parity> conduit = new ModalFlatMapConduit<>(
          Parity.ODD, p -> n -> Arrays.asList(n, n + (p == Parity.ODD ? 1 : 2)),
          schedule, Duration.ofSeconds(2));

      emitOutputOnVariableSchedule(schedule, conduit);
    }

  }

  private void emitOutputOnVariableSchedule(final FakeSchedule schedule,
                                            final ModalFlatMapConduit<Integer, Integer, Parity> conduit) {
    final ArrayList<Integer> results = new ArrayList<>(2);

    final Receptacle<Integer> receptacle = n -> results.add(n.get());

    conduit.subscribe(receptacle);

    Assert.assertTrue(schedule.getScheduled().isEmpty());
    conduit.first().notifyChange(Deferred.value(1));

    check(schedule, results, Parity.ODD, 2000, 1);

    Assert.assertEquals(schedule.getScheduled().size(), 0);

    results.clear();

    conduit.second().notifyChange(Deferred.value(Duration.ofSeconds(5)));
    conduit.first().notifyChange(Deferred.value(3));

    check(schedule, results, Parity.ODD, 5000, 3);

    Assert.assertEquals(schedule.getScheduled().size(), 0);

    results.clear();

    conduit.third().notifyChange(Deferred.value(Parity.EVEN));
    conduit.first().notifyChange(Deferred.value(5));

    check(schedule, results, Parity.EVEN, 5000, 5);
  }

  private void check(final FakeSchedule schedule, final ArrayList<Integer> results,
                     final Parity p,
                     final long delay,
                     final int start) {
    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0).intValue(), start);

    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(delay));
    schedule.runScheduled(delay);
    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(1).intValue(), start + (p == Parity.ODD ? 1 : 2));
  }

}
