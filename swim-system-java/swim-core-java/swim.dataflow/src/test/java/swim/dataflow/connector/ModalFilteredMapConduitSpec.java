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
import java.util.HashSet;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.dataflow.connector.ConnectorTestUtil.MapAction;
import swim.dataflow.connector.ConnectorTestUtil.Parity;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.structure.Form;
import static swim.dataflow.graph.Either.left;
import static swim.dataflow.graph.Either.right;

public class ModalFilteredMapConduitSpec {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void changeFilterByMode(final boolean withState) {

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

      final ValuePersister<Parity> modePersister = provider.forValue("mode",
          Form.forEnum(Parity.class), Parity.ODD);
      final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter = new ModalFilteredMapConduit<>(
          modePersister,
          (Parity p) -> (Integer n, Integer s) -> (n % 2 == p.ordinal()) || (s % 2 == p.ordinal()));

      changeFilterByMode(modalFilter);

      Assert.assertEquals(modePersister.get(), Parity.EVEN);
    } else {
      final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter = new ModalFilteredMapConduit<>(Parity.ODD,
          p -> (n, s) -> (n % 2 == p.ordinal()) || (s % 2 == p.ordinal()));

      changeFilterByMode(modalFilter);
    }

  }

  private void changeFilterByMode(final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter) {
    final ConnectorTestUtil.ActionAccumulator<Integer, Integer> acc =
        new ConnectorTestUtil.ActionAccumulator<>();

    final ArrayList<MapAction<Integer, Integer>> results = ConnectorTestUtil.pushData(modalFilter,
        left(acc.update(1, 2)),
        right(Parity.EVEN),
        left(acc.update(4, 4)));

    Assert.assertEquals(results.size(), 2);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 1);
      Assert.assertEquals(v.intValue(), 2);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(1).get().intValue(), 2);
    });

    ConnectorTestUtil.expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 4);
      Assert.assertEquals(v.intValue(), 4);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(1).get().intValue(), 2);
      Assert.assertEquals(m.get(4).get().intValue(), 4);
    });
  }

  @Test(dataProvider = "withState")
  public void retroactivelyRemoveInvalidEntries(final boolean withState) {

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

      final ValuePersister<Parity> modePersister = provider.forValue("mode",
          Form.forEnum(Parity.class), Parity.ODD);
      final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter = new ModalFilteredMapConduit<>(
          modePersister,
          (Parity p) -> (Integer n, Integer s) -> (n % 2 == p.ordinal()) || (s % 2 == p.ordinal()));

      retroactivelyRemoveInvalidEntries(modalFilter);

      Assert.assertEquals(modePersister.get(), Parity.EVEN);
    } else {
      final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter = new ModalFilteredMapConduit<>(Parity.ODD,
          p -> (n, s) -> (n % 2 == p.ordinal()) || (s % 2 == p.ordinal()));

      retroactivelyRemoveInvalidEntries(modalFilter);
    }

  }

  private void retroactivelyRemoveInvalidEntries(final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter) {
    final ConnectorTestUtil.ActionAccumulator<Integer, Integer> acc =
        new ConnectorTestUtil.ActionAccumulator<>();

    final ArrayList<MapAction<Integer, Integer>> results = ConnectorTestUtil.pushData(modalFilter,
        left(acc.update(1, 2)),
        right(Parity.EVEN),
        left(acc.update(1, 1)));

    Assert.assertEquals(results.size(), 2);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 1);
      Assert.assertEquals(v.intValue(), 2);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(1).get().intValue(), 2);
    });

    ConnectorTestUtil.expectRemoval(results.get(1), (k, m) -> {
      Assert.assertEquals(k.intValue(), 1);
      Assert.assertEquals(m.size(), 0);
    });
  }

  @Test(dataProvider = "withState")
  public void retroactivelyRestoreValidKeys(final boolean withState) {
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

      final ValuePersister<Parity> modePersister = provider.forValue("mode",
          Form.forEnum(Parity.class), Parity.ODD);
      final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter = new ModalFilteredMapConduit<>(
          modePersister,
          (Parity p) -> (Integer n, Integer s) -> (n % 2 == p.ordinal()) || (s % 2 == p.ordinal()));

      retroactivelyRestoreValidKeys(modalFilter);

      Assert.assertEquals(modePersister.get(), Parity.EVEN);
    } else {
      final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter = new ModalFilteredMapConduit<>(Parity.ODD,
          p -> (n, s) -> (n % 2 == p.ordinal()) || (s % 2 == p.ordinal()));

      retroactivelyRestoreValidKeys(modalFilter);
    }


  }

  private void retroactivelyRestoreValidKeys(final ModalFilteredMapConduit<Integer, Integer, Parity> modalFilter) {
    final ConnectorTestUtil.ActionAccumulator<Integer, Integer> acc =
        new ConnectorTestUtil.ActionAccumulator<>();

    final ArrayList<MapAction<Integer, Integer>> results1 = ConnectorTestUtil.pushData(modalFilter,
        left(acc.update(2, 2)),
        left(acc.update(6, 6)));

    Assert.assertEquals(results1.size(), 0);

    final ArrayList<MapAction<Integer, Integer>> results2 = ConnectorTestUtil.pushData(modalFilter, right(Parity.EVEN));

    Assert.assertEquals(results2.size(), 2);

    final HashSet<Integer> expectedAdditions = new HashSet<>();
    expectedAdditions.add(2);
    expectedAdditions.add(6);

    ConnectorTestUtil.expectUpdate(results2.get(0), (k, v, m) -> {
      Assert.assertTrue(expectedAdditions.contains(k));
      expectedAdditions.remove(k);
      Assert.assertEquals(v, k);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(2).get().intValue(), 2);
      Assert.assertEquals(m.get(6).get().intValue(), 6);
    });

    ConnectorTestUtil.expectUpdate(results2.get(1), (k, v, m) -> {
      Assert.assertTrue(expectedAdditions.contains(k));
      expectedAdditions.remove(k);
      Assert.assertEquals(v, k);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(2).get().intValue(), 2);
      Assert.assertEquals(m.get(6).get().intValue(), 6);
    });
  }

}
