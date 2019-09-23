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
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.dataflow.connector.ConnectorTestUtil.FakeSchedule;
import swim.dataflow.connector.Deferred;
import swim.dataflow.graph.Pair;
import swim.dataflow.graph.timestamps.TimestampAssigner;

public class WindowConduitSpec {

  @Test
  public void timestampsFromData() {

    final FakePaneManager manager = new FakePaneManager(man -> { });
    final FakeSchedule schedule = new FakeSchedule();
    final WindowConduit<Pair<Long, Integer>, Integer, Integer> conduit = new WindowConduit<>(
        schedule, manager, TimestampAssigner.fromData(Pair::getFirst));

    final ArrayList<Integer> outputs = new ArrayList<>();
    final ArrayList<Pair<Long, Long>> executedCallbacks = new ArrayList<>();

    conduit.subscribe(n -> outputs.add(n.get()));

    final Pair<Long, Integer> input1 = Pair.pair(1000L, 5);

    final PaneManager.WindowCallback cb1 = (requested, actual) -> executedCallbacks.add(Pair.pair(requested, actual));

    //Expect the appropriate input and register a timer event in response.

    final Expectation exp1 = new Expectation(input1, 1000L, Pair.pair(2500L, cb1), null);
    manager.expect(exp1);

    conduit.notifyChange(Deferred.value(input1));
    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertTrue(outputs.isEmpty());
    Assert.assertTrue(executedCallbacks.isEmpty());

    final Pair<Long, Integer> input2 = Pair.pair(2000L, 7);

    //Expect the next input and produce an output.

    final Expectation exp2 = new Expectation(input2, 2000L, null, Pair.pair(9, 10));
    manager.expect(exp2);

    conduit.notifyChange(Deferred.value(input2));

    //Verify the expected output.
    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertEquals(outputs.size(), 1);
    Assert.assertEquals(outputs.get(0).intValue(), 10);
    Assert.assertTrue(executedCallbacks.isEmpty());

    outputs.clear();

    //Feed a new input that is past the timer we registered earlier.
    final Pair<Long, Integer> input3 = Pair.pair(3000L, 17);

    final Expectation exp3 = new Expectation(input3, 3000L);
    manager.expect(exp3);

    conduit.notifyChange(Deferred.value(input3));

    //Verify that the timer event was received.
    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertTrue(outputs.isEmpty());
    Assert.assertEquals(executedCallbacks.size(), 1);
    Assert.assertEquals(executedCallbacks.get(0), Pair.pair(2500L, 3000L));

  }

  @Test
  public void timestampsFromClock() {

    final FakePaneManager manager = new FakePaneManager(man -> { });
    final FakeSchedule schedule = new FakeSchedule();
    final FakeClock clock = new FakeClock();
    final WindowConduit<Pair<Long, Integer>, Integer, Integer> conduit = new WindowConduit<>(
        schedule, manager, clock);

    final ArrayList<Integer> outputs = new ArrayList<>();
    final ArrayList<Pair<Long, Long>> executedCallbacks = new ArrayList<>();

    conduit.subscribe(n -> outputs.add(n.get()));

    final Pair<Long, Integer> input1 = Pair.pair(1000L, 5);


    final PaneManager.WindowCallback cb1 = (requested, actual) -> executedCallbacks.add(Pair.pair(requested, actual));


    //Expect the appropriate input and request a callback.
    final Expectation exp1 = new Expectation(input1, 1000L, Pair.pair(2500L, cb1), null);
    manager.expect(exp1);

    //Verify that the callback was sent to the scheduler.
    conduit.notifyChange(Deferred.value(input1));
    Assert.assertEquals(schedule.getScheduled().size(), 1);
    Assert.assertTrue(schedule.getScheduled().containsKey(1500L));
    Assert.assertTrue(outputs.isEmpty());
    Assert.assertTrue(executedCallbacks.isEmpty());

    //Trigger the callback.
    clock.advance(2500L);

    schedule.runScheduled(1500L);

    //Verify that the callback was received.
    Assert.assertTrue(schedule.getScheduled().isEmpty());
    Assert.assertTrue(outputs.isEmpty());
    Assert.assertEquals(executedCallbacks.size(), 1);
    Assert.assertEquals(executedCallbacks.get(0), Pair.pair(2500L, 2500L));
  }

}
