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

import java.util.ArrayList;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.dataflow.graph.Either;
import swim.dataflow.graph.persistence.ListPersister;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialListPersister;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialValuePersister;

public class VariableDelayJunctionSpec {

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForZeroDelay() {
    new VariableDelayJunction<>(0);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForZeroDelayFromState() {
    new VariableDelayJunction<Integer>(new TrivialListPersister<>(), new TrivialValuePersister<>(0));
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForNegativeDelay() {
    new VariableDelayJunction<>(-1);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void failsForNegativeDelayFromState() {
    new VariableDelayJunction<Integer>(new TrivialListPersister<>(), new TrivialValuePersister<>(-1));
  }

  @Test
  public void emitsNothingOnIntialInput() {
    final VariableDelayJunction<Integer> conduit = new VariableDelayJunction<>(1);
    final ArrayList<Integer> results = ConnectorTestUtil.pushData(conduit, Either.left(7));
    Assert.assertTrue(results.isEmpty());
  }

  @Test
  public void emitsPreviousValues() {
    final VariableDelayJunction<Integer> conduit = new VariableDelayJunction<>(1);
    final ArrayList<Integer> results1 = ConnectorTestUtil.pushData(conduit, Either.left(7));
    Assert.assertTrue(results1.isEmpty());
    final ArrayList<Integer> results2 = ConnectorTestUtil.pushData(conduit, Either.left(5));
    Assert.assertEquals(results2.size(), 1);
    Assert.assertEquals(results2.get(0).intValue(), 7);
    final ArrayList<Integer> results3 = ConnectorTestUtil.pushData(conduit, Either.left(2));
    Assert.assertEquals(results3.size(), 1);
    Assert.assertEquals(results3.get(0).intValue(), 5);
  }

  @Test
  public void emitsWithLongerDelay() {
    final VariableDelayJunction<Integer> conduit = new VariableDelayJunction<>(3);
    final ArrayList<Integer> results1 = ConnectorTestUtil.pushData(
        conduit, Either.left(6), Either.left(5), Either.left(98));
    Assert.assertTrue(results1.isEmpty());
    final ArrayList<Integer> results2 = ConnectorTestUtil.pushData(conduit, Either.left(76));
    Assert.assertEquals(results2.size(), 1);
    Assert.assertEquals(results2.get(0).intValue(), 6);
  }

  @Test
  public void storesBufferInState() {
    final ListPersister<Integer> state = new TrivialListPersister<>();
    final VariableDelayJunction<Integer> conduit = new VariableDelayJunction<>(state,
        new TrivialValuePersister<>(2));
    ConnectorTestUtil.pushData(conduit, Either.left(1), Either.left(2), Either.left(3), Either.left(4));
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
    final VariableDelayJunction<Integer> conduit = new VariableDelayJunction<>(state,
        new TrivialValuePersister<>(2));
    final ArrayList<Integer> results = ConnectorTestUtil.pushData(conduit, Either.left(4));
    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0).intValue(), 2);
  }

  @Test
  public void handleReductionInBufferSize() {
    final VariableDelayJunction<Integer> conduit = new VariableDelayJunction<>(3);
    final ArrayList<Integer> results1 = ConnectorTestUtil.pushData(
        conduit, Either.left(1), Either.left(2), Either.left(3), Either.left(4));

    Assert.assertEquals(results1.size(), 1);
    Assert.assertEquals(results1.get(0).intValue(), 1);

    final ArrayList<Integer> results2 = ConnectorTestUtil.pushData(conduit, Either.right(1));

    Assert.assertTrue(results2.isEmpty());

    final ArrayList<Integer> results3 = ConnectorTestUtil.pushData(conduit, Either.left(5));

    Assert.assertEquals(results3.size(), 1);
    Assert.assertEquals(results3.get(0).intValue(), 4);
  }

  @Test
  public void handleIncreaseInBufferSize() {
    final VariableDelayJunction<Integer> conduit = new VariableDelayJunction<>(2);
    final ArrayList<Integer> results1 = ConnectorTestUtil.pushData(
        conduit, Either.left(1), Either.left(2));

    Assert.assertTrue(results1.isEmpty());

    final ArrayList<Integer> results2 = ConnectorTestUtil.pushData(conduit, Either.right(3));

    Assert.assertTrue(results2.isEmpty());

    final ArrayList<Integer> results3 = ConnectorTestUtil.pushData(conduit, Either.left(3));

    Assert.assertTrue(results3.isEmpty());

    final ArrayList<Integer> results4 = ConnectorTestUtil.pushData(conduit, Either.left(4));

    Assert.assertEquals(results4.size(), 1);
    Assert.assertEquals(results4.get(0).intValue(), 1);
  }

  @Test
  public void storesDelayInState() {
    final ListPersister<Integer> bufferState = new TrivialListPersister<>();
    final TrivialValuePersister<Integer> delayState = new TrivialValuePersister<>(2);
    final VariableDelayJunction<Integer> junction = new VariableDelayJunction<>(bufferState, delayState);

    ConnectorTestUtil.pushData(junction, Either.right(3));

    Assert.assertEquals(delayState.get().intValue(), 3);
  }

  @Test
  public void ignoresInvalidDelays() {
    final TrivialValuePersister<Integer> delayState = new TrivialValuePersister<>(2);
    final VariableDelayJunction<Integer> conduit = new VariableDelayJunction<>(
        new TrivialListPersister<>(), delayState);
    final ArrayList<Integer> results1 = ConnectorTestUtil.pushData(
        conduit, Either.left(1), Either.left(2));

    Assert.assertTrue(results1.isEmpty());

    final ArrayList<Integer> results2 = ConnectorTestUtil.pushData(conduit, Either.right(-1));

    Assert.assertTrue(results2.isEmpty());

    final ArrayList<Integer> results3 = ConnectorTestUtil.pushData(conduit, Either.left(3));

    Assert.assertEquals(results3.size(), 1);
    Assert.assertEquals(results3.get(0).intValue(), 1);

    Assert.assertEquals(delayState.get().intValue(), 2);
  }

}
