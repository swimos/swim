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
import java.util.Arrays;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.util.Deferred;

public class FlatMapConduitSpec {

  @Test
  public void emitOutputsOnSchedule() {
    final ConnectorTestUtil.FakeSchedule schedule = new ConnectorTestUtil.FakeSchedule();

    final FlatMapConduit<Integer, Integer> conduit = new FlatMapConduit<>(n -> Arrays.asList(n, n + 1, n + 2, n + 3),
        schedule, Duration.ofSeconds(2));

    final ArrayList<Integer> results = new ArrayList<>(4);

    final Receptacle<Integer> receptacle = n -> results.add(n.get());

    conduit.subscribe(receptacle);

    Assert.assertTrue(schedule.getScheduled().isEmpty());
    conduit.notifyChange(Deferred.value(1));

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0).intValue(), 1);

    for (int i = 0; i < 3; ++i) {
      Assert.assertEquals(schedule.getScheduled().size(), 1);
      Assert.assertTrue(schedule.getScheduled().containsKey(2000L));
      schedule.runScheduled(2000L);
      Assert.assertEquals(results.size(), i + 2);
      Assert.assertEquals(results.get(i + 1).intValue(), i + 2);
    }

    Assert.assertEquals(schedule.getScheduled().size(), 0);
  }

}
