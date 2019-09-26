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
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.streamlet.persistence.ListPersister;
import swim.streamlet.persistence.TrivialPersistenceProvider.TrivialListPersister;

public class DelayConduitSpec {

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForZeroDelay() {
    new DelayConduit<>(0);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForNegativeDelay() {
    new DelayConduit<>(-1);
  }

  @Test
  public void emitsNothingOnIntialInput() {
    final DelayConduit<Integer> conduit = new DelayConduit<>(1);
    final ArrayList<Integer> results = ConnectorUtilities.pushData(conduit, 7);
    Assert.assertTrue(results.isEmpty());
  }

  @Test
  public void emitsPreviousValues() {
    final DelayConduit<Integer> conduit = new DelayConduit<>(1);
    final ArrayList<Integer> results1 = ConnectorUtilities.pushData(conduit, 7);
    Assert.assertTrue(results1.isEmpty());
    final ArrayList<Integer> results2 = ConnectorUtilities.pushData(conduit, 5);
    Assert.assertEquals(results2.size(), 1);
    Assert.assertEquals(results2.get(0).intValue(), 7);
    final ArrayList<Integer> results3 = ConnectorUtilities.pushData(conduit, 2);
    Assert.assertEquals(results3.size(), 1);
    Assert.assertEquals(results3.get(0).intValue(), 5);
  }

  @Test
  public void emitsWithLongerDelay() {
    final DelayConduit<Integer> conduit = new DelayConduit<>(3);
    final ArrayList<Integer> results1 = ConnectorUtilities.pushData(conduit, 6, 5, 98);
    Assert.assertTrue(results1.isEmpty());
    final ArrayList<Integer> results2 = ConnectorUtilities.pushData(conduit, 76);
    Assert.assertEquals(results2.size(), 1);
    Assert.assertEquals(results2.get(0).intValue(), 6);
  }

  @Test
  public void storesBufferInState() {
    final ListPersister<Integer> state = new TrivialListPersister<>();
    final DelayConduit<Integer> conduit = new DelayConduit<>(state, 2);
    ConnectorUtilities.pushData(conduit, 1, 2, 3, 4);
    Assert.assertEquals(state.size(), 3);
    Assert.assertEquals(state.get(0).intValue(), 2);
    Assert.assertEquals(state.get(1).intValue(), 3);
    Assert.assertEquals(state.get(2).intValue(), 4);

  }

  @Test
  public void restoreBufferFromState() {
    final ListPersister<Integer> state = new TrivialListPersister<>();
    state.append(1);
    state.append(2);
    state.append(3);
    final DelayConduit<Integer> conduit = new DelayConduit<>(state, 2);
    final ArrayList<Integer> results = ConnectorUtilities.pushData(conduit, 4);
    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0).intValue(), 2);
  }

}
