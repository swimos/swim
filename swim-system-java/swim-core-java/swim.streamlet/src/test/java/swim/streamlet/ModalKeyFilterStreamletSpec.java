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
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.streaming.persistence.TrivialPersistenceProvider;
import swim.streaming.persistence.ValuePersister;
import swim.streamlet.ConnectorUtilities.ActionAccumulator;
import swim.structure.Form;
import swim.util.Either;

public class ModalKeyFilterStreamletSpec extends ConnectorTest {

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

      final ModalKeyFilterStreamlet<Integer, String, Parity> streamlet =
          new ModalKeyFilterStreamlet<>(modePersister,
              (Parity p) -> (Integer k) -> k % 2 == p.ordinal());

      filterOutInputData(streamlet);

      Assert.assertEquals(modePersister.get(), Parity.EVEN);
    } else {
      final ModalKeyFilterStreamlet<Integer, String, Parity> streamlet =
          new ModalKeyFilterStreamlet<>(Parity.EVEN, p -> k -> k % 2 == p.ordinal());

      filterOutInputData(streamlet);
    }
  }

  private void filterOutInputData(final ModalKeyFilterStreamlet<Integer, String, Parity> streamlet) {
    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    final ArrayList<ConnectorUtilities.MapAction<Integer, String>> results =
        ConnectorUtilities.pushData(streamlet, Either.left(acc.update(2, "a")));

    Assert.assertEquals(results.size(), 1);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(k).get(), "a");
    });

    final ArrayList<ConnectorUtilities.MapAction<Integer, String>> results2 =
        ConnectorUtilities.pushData(streamlet, Either.left(acc.update(1, "aaa")));

    Assert.assertEquals(results2.size(), 0);
  }

  @Test(dataProvider = "withState")
  public void alterPredicate(final boolean withState) {

    if (withState) {

      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Integer> modePersister = provider.forValue("mode",
          Form.forInteger(), 3);

      final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet =
          new ModalKeyFilterStreamlet<>(modePersister,
              (Integer n) -> (Integer k) -> k % n == 0);

      alterPredicate(streamlet);
      Assert.assertEquals(modePersister.get().intValue(), 2);

    } else {
      final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet =
          new ModalKeyFilterStreamlet<>(3, n -> k -> k % n == 0);

      alterPredicate(streamlet);
    }
  }

  private void alterPredicate(final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet) {
    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    final ArrayList<ConnectorUtilities.MapAction<Integer, String>> results = ConnectorUtilities.pushData(
        streamlet,
        Either.left(acc.update(6, "a")),
        Either.left(acc.update(7, "b")),
        Either.right(2),
        Either.left(acc.update(4, "c")));

    Assert.assertEquals(results.size(), 2);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 6);
      Assert.assertEquals(v, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(6).get(), "a");
    });

    expectUpdate(results.get(1), (k, v, m) -> {
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

      final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet =
          new ModalKeyFilterStreamlet<>(modePersister,
              (Integer n) -> (Integer k) -> k % n == 0);

      retroactivelyRemoveInvalidKeys(streamlet);
      Assert.assertEquals(modePersister.get().intValue(), 2);

    } else {
      final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet =
          new ModalKeyFilterStreamlet<>(3, n -> k -> k % n == 0);

      retroactivelyRemoveInvalidKeys(streamlet);
    }

  }

  private void retroactivelyRemoveInvalidKeys(final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet) {
    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    ConnectorUtilities.pushData(
        streamlet,
        Either.left(acc.update(3, "a")),
        Either.left(acc.update(6, "b")));

    final ArrayList<ConnectorUtilities.MapAction<Integer, String>> results =
        ConnectorUtilities.pushData(streamlet, Either.right(2));

    Assert.assertEquals(results.size(), 1);

    expectRemoval(results.get(0), (k, m) -> {
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

      final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet =
          new ModalKeyFilterStreamlet<>(modePersister,
              (Integer n) -> (Integer k) -> k % n == 0);

      retroactivelyRestoreValidKeys(streamlet);
      Assert.assertEquals(modePersister.get().intValue(), 2);

    } else {
      final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet =
          new ModalKeyFilterStreamlet<>(3, n -> k -> k % n == 0);

      retroactivelyRestoreValidKeys(streamlet);
    }


  }

  private void retroactivelyRestoreValidKeys(final ModalKeyFilterStreamlet<Integer, String, Integer> streamlet) {
    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    ConnectorUtilities.pushData(
        streamlet,
        Either.left(acc.update(6, "a")),
        Either.left(acc.update(8, "b")));

    final ArrayList<ConnectorUtilities.MapAction<Integer, String>> results =
        ConnectorUtilities.pushData(streamlet, Either.right(2));

    Assert.assertEquals(results.size(), 1);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 8);
      Assert.assertEquals(v, "b");
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(6).get(), "a");
      Assert.assertEquals(m.get(8).get(), "b");
    });
  }

}
