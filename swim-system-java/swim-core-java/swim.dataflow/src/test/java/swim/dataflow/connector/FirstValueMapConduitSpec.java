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
import swim.collections.HashTrieSet;
import swim.dataflow.connector.ConnectorTestUtil.MapAction;
import swim.dataflow.graph.persistence.MapPersister;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialMapPersister;
import swim.structure.Form;
import static swim.dataflow.connector.ConnectorTestUtil.remove;
import static swim.dataflow.connector.ConnectorTestUtil.update;

public class FirstValueMapConduitSpec {

  @DataProvider(name = "resetOnRemoval")
  public Object[][] restOnRemoval() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "resetOnRemoval")
  public void emitsTheFirstValueForAKey(final boolean resetOnRemoval) {

    final FirstValueMapConduit<String, Integer> conduit =
        new FirstValueMapConduit<>(resetOnRemoval, Form.forInteger());

    final ArrayList<MapAction<String, Integer>> results = ConnectorTestUtil.pushData(conduit, update("a", 3));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 3);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
    });
  }

  @Test(dataProvider = "resetOnRemoval")
  public void doesNotEmitValuesAfterFirstForAKey(final boolean resetOnRemoval) {
    final FirstValueMapConduit<String, Integer> conduit =
        new FirstValueMapConduit<>(resetOnRemoval, Form.forInteger());

    final ArrayList<MapAction<String, Integer>> results = ConnectorTestUtil.pushData(conduit, update("a", 3));

    Assert.assertEquals(results.size(), 1);

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorTestUtil.pushData(conduit, update("a", 5));

    Assert.assertTrue(results2.isEmpty());
  }

  @Test(dataProvider = "resetOnRemoval")
  public void remembersValuesForPastKeys(final boolean resetOnRemoval) {
    final FirstValueMapConduit<String, Integer> conduit =
        new FirstValueMapConduit<>(resetOnRemoval, Form.forInteger());

    final ArrayList<MapAction<String, Integer>> results = ConnectorTestUtil.pushData(conduit, update("a", 3));

    Assert.assertEquals(results.size(), 1);

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorTestUtil.pushData(conduit, update("b", 7));

    Assert.assertEquals(results2.size(), 1);

    ConnectorTestUtil.expectUpdate(results2.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });
  }

  @Test
  public void ignoresRemovalsInNoResetMode() {
    final FirstValueMapConduit<String, Integer> conduit =
        new FirstValueMapConduit<>(false, Form.forInteger());

    final ArrayList<MapAction<String, Integer>> results = ConnectorTestUtil.pushData(conduit, update("a", 3));

    Assert.assertEquals(results.size(), 1);

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorTestUtil.pushData(conduit, remove("a"));

    Assert.assertTrue(results2.isEmpty());

    final ArrayList<MapAction<String, Integer>> results3 = ConnectorTestUtil.pushData(conduit, update("a", 5));

    Assert.assertTrue(results3.isEmpty());

    final ArrayList<MapAction<String, Integer>> results4 = ConnectorTestUtil.pushData(conduit, update("b", 7));

    Assert.assertEquals(results4.size(), 1);

    ConnectorTestUtil.expectUpdate(results4.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });
  }

  @Test
  public void removesFirstValueInResetMode() {
    final FirstValueMapConduit<String, Integer> conduit =
        new FirstValueMapConduit<>(true, Form.forInteger());

    final ArrayList<MapAction<String, Integer>> results = ConnectorTestUtil.pushData(conduit, update("a", 3));

    Assert.assertEquals(results.size(), 1);

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorTestUtil.pushData(conduit, remove("a"));

    Assert.assertEquals(results2.size(), 1);

    ConnectorTestUtil.expectRemoval(results2.get(0), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });

    final ArrayList<MapAction<String, Integer>> results3 = ConnectorTestUtil.pushData(conduit, update("b", 7));

    Assert.assertEquals(results3.size(), 1);

    ConnectorTestUtil.expectUpdate(results3.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });

    final ArrayList<MapAction<String, Integer>> results4 = ConnectorTestUtil.pushData(conduit, update("a", 5));

    Assert.assertEquals(results4.size(), 1);

    ConnectorTestUtil.expectUpdate(results4.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 5);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 5);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });

  }

  @Test(dataProvider = "resetOnRemoval")
  public void storesFirstValuesInState(final boolean resetOnRemoval) {
    final MapPersister<String, Integer> persister = new TrivialMapPersister<>(Form.forInteger());

    final FirstValueMapConduit<String, Integer> conduit = new FirstValueMapConduit<>(resetOnRemoval, persister);

    final ArrayList<MapAction<String, Integer>> results = ConnectorTestUtil.pushData(conduit, update("a", 3));

    Assert.assertEquals(results.size(), 1);

    Assert.assertEquals(persister.keys(), HashTrieSet.of("a"));
    Assert.assertEquals(persister.get("a").intValue(), 3);
  }

  @Test(dataProvider = "resetOnRemoval")
  public void restoresFromState(final boolean resetOnRemoval) {
    final MapPersister<String, Integer> persister = new TrivialMapPersister<>(Form.forInteger());
    persister.put("a", 3);

    final FirstValueMapConduit<String, Integer> conduit = new FirstValueMapConduit<>(resetOnRemoval, persister);

    final ArrayList<MapAction<String, Integer>> results1 = ConnectorTestUtil.pushData(conduit, update("a", 5));

    Assert.assertTrue(results1.isEmpty());

    final ArrayList<MapAction<String, Integer>> results2 = ConnectorTestUtil.pushData(conduit, update("b", 7));

    Assert.assertEquals(results2.size(), 1);

    ConnectorTestUtil.expectUpdate(results2.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 3);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });

  }

}
