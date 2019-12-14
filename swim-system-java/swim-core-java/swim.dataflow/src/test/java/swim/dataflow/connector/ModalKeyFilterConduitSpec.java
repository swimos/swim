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
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.dataflow.connector.ConnectorTestUtil.ActionAccumulator;
import swim.dataflow.connector.ConnectorTestUtil.Parity;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.structure.Form;
import static swim.dataflow.graph.Either.left;
import static swim.dataflow.graph.Either.right;

public class ModalKeyFilterConduitSpec {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void filterOutInputData(final boolean withState) {
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Parity> modePersister = provider.forValue("mode",
          Form.forEnum(Parity.class), Parity.EVEN);

      final ModalKeyFilterConduit<Integer, String, Parity> conduit =
          new ModalKeyFilterConduit<>(modePersister,
              (Parity p) -> (Integer k) -> k % 2 == p.ordinal());

      filterOutInputData(conduit);

      Assert.assertEquals(modePersister.get(), Parity.EVEN);
    } else {
      final ModalKeyFilterConduit<Integer, String, Parity> conduit =
          new ModalKeyFilterConduit<>(Parity.EVEN, p -> k -> k % 2 == p.ordinal());

      filterOutInputData(conduit);
    }
  }

  private void filterOutInputData(final ModalKeyFilterConduit<Integer, String, Parity> conduit) {
    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    final ArrayList<ConnectorTestUtil.MapAction<Integer, String>> results =
        ConnectorTestUtil.pushData(conduit, left(acc.update(2, "a")));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(k).get(), "a");
    });

    final ArrayList<ConnectorTestUtil.MapAction<Integer, String>> results2 =
        ConnectorTestUtil.pushData(conduit, left(acc.update(1, "aaa")));

    Assert.assertEquals(results2.size(), 0);
  }

  @Test(dataProvider = "withState")
  public void alterPredicate(final boolean withState) {

    if (withState) {

      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Integer> modePersister = provider.forValue("mode",
          Form.forInteger(), 3);

      final ModalKeyFilterConduit<Integer, String, Integer> conduit =
          new ModalKeyFilterConduit<>(modePersister,
              (Integer n) -> (Integer k) -> k % n == 0);

      alterPredicate(conduit);
      Assert.assertEquals(modePersister.get().intValue(), 2);

    } else {
      final ModalKeyFilterConduit<Integer, String, Integer> conduit =
          new ModalKeyFilterConduit<>(3, n -> k -> k % n == 0);

      alterPredicate(conduit);
    }
  }

  private void alterPredicate(final ModalKeyFilterConduit<Integer, String, Integer> conduit) {
    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    final ArrayList<ConnectorTestUtil.MapAction<Integer, String>> results = ConnectorTestUtil.pushData(
        conduit,
        left(acc.update(6, "a")),
        left(acc.update(7, "b")),
        right(2),
        left(acc.update(4, "c")));

    Assert.assertEquals(results.size(), 2);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 6);
      Assert.assertEquals(v, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(6).get(), "a");
    });

    ConnectorTestUtil.expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 4);
      Assert.assertEquals(v, "c");
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(6).get(), "a");
      Assert.assertEquals(m.get(4).get(), "c");
    });
  }

  @Test(dataProvider = "withState")
  public void retroactivelyRemoveInvalidKeys(final boolean withState) {
    if (withState) {

      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Integer> modePersister = provider.forValue("mode",
          Form.forInteger(), 3);

      final ModalKeyFilterConduit<Integer, String, Integer> conduit =
          new ModalKeyFilterConduit<>(modePersister,
              (Integer n) -> (Integer k) -> k % n == 0);

      retroactivelyRemoveInvalidKeys(conduit);
      Assert.assertEquals(modePersister.get().intValue(), 2);

    } else {
      final ModalKeyFilterConduit<Integer, String, Integer> conduit =
          new ModalKeyFilterConduit<>(3, n -> k -> k % n == 0);

      retroactivelyRemoveInvalidKeys(conduit);
    }

  }

  private void retroactivelyRemoveInvalidKeys(final ModalKeyFilterConduit<Integer, String, Integer> conduit) {
    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    ConnectorTestUtil.pushData(
        conduit,
        left(acc.update(3, "a")),
        left(acc.update(6, "b")));

    final ArrayList<ConnectorTestUtil.MapAction<Integer, String>> results =
        ConnectorTestUtil.pushData(conduit, right(2));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectRemoval(results.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(6).get(), "b");
    });
  }

  @Test(dataProvider = "withState")
  public void retroactivelyRestoreValidKeys(final boolean withState) {
    if (withState) {

      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Integer> modePersister = provider.forValue("mode",
          Form.forInteger(), 3);

      final ModalKeyFilterConduit<Integer, String, Integer> conduit =
          new ModalKeyFilterConduit<>(modePersister,
              (Integer n) -> (Integer k) -> k % n == 0);

      retroactivelyRestoreValidKeys(conduit);
      Assert.assertEquals(modePersister.get().intValue(), 2);

    } else {
      final ModalKeyFilterConduit<Integer, String, Integer> conduit =
          new ModalKeyFilterConduit<>(3, n -> k -> k % n == 0);

      retroactivelyRestoreValidKeys(conduit);
    }


  }

  private void retroactivelyRestoreValidKeys(final ModalKeyFilterConduit<Integer, String, Integer> conduit) {
    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    ConnectorTestUtil.pushData(
        conduit,
        left(acc.update(6, "a")),
        left(acc.update(8, "b")));

    final ArrayList<ConnectorTestUtil.MapAction<Integer, String>> results =
        ConnectorTestUtil.pushData(conduit, right(2));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 8);
      Assert.assertEquals(v, "b");
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(6).get(), "a");
      Assert.assertEquals(m.get(8).get(), "b");
    });
  }

}
