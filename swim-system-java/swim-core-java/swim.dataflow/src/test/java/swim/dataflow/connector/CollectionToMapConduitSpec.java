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
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.collections.HashTrieSet;
import swim.dataflow.connector.ConnectorTestUtil.MapAction;
import swim.dataflow.graph.Pair;
import swim.dataflow.graph.persistence.MapPersister;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider;
import swim.structure.Form;
import static swim.dataflow.graph.Pair.pair;

public class CollectionToMapConduitSpec {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void initializeFromNothing(final boolean withState) {

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final MapPersister<Integer, String> persister = provider.forMap(
          "state", Form.forInteger(), Form.forString());
      final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit =
          new CollectionToMapConduit<>(n -> n, Object::toString, persister);

      initializeFromNothing(conduit);

      Assert.assertEquals(persister.keys(), HashTrieSet.of(1, 2, 3));
      Assert.assertEquals(persister.get(1), "1");
      Assert.assertEquals(persister.get(2), "2");
      Assert.assertEquals(persister.get(3), "3");
    } else {
      final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit =
          new CollectionToMapConduit<>(n -> n, Object::toString, Form.forString());

      initializeFromNothing(conduit);
    }
  }

  private void initializeFromNothing(final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit) {
    final ArrayList<MapAction<Integer, String>> results = ConnectorTestUtil.pushData(
        conduit, HashTrieSet.of(1, 2, 3));

    Assert.assertEquals(results.size(), 3);

    final HashSet<Integer> keys = new HashSet<>();
    for (final MapAction<Integer, String> action : results) {
      ConnectorTestUtil.expectUpdate(action, (k, v, m) -> {
        keys.add(k);
        Assert.assertEquals(v, k.toString());
        Assert.assertEquals(m.size(), keys.size());
        for (final Integer key : keys) {
          Assert.assertTrue(m.containsKey(key));
          Assert.assertEquals(m.get(key).get(), key.toString());
        }
      });
    }
  }

  @Test(dataProvider = "withState")
  public void addAdditionalEntry(final boolean withState) {
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final MapPersister<Integer, String> persister = provider.forMap(
          "state", Form.forInteger(), Form.forString());
      final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit =
          new CollectionToMapConduit<>(n -> n, Object::toString, persister);

      addAdditionalEntry(conduit);

      Assert.assertEquals(persister.keys(), HashTrieSet.of(1, 2, 3, 4));
      Assert.assertEquals(persister.get(1), "1");
      Assert.assertEquals(persister.get(2), "2");
      Assert.assertEquals(persister.get(3), "3");
      Assert.assertEquals(persister.get(4), "4");
    } else {
      final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit =
          new CollectionToMapConduit<>(n -> n, Object::toString, Form.forString());

      addAdditionalEntry(conduit);
    }

  }

  private void addAdditionalEntry(final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit) {
    ConnectorTestUtil.pushData(
        conduit, HashTrieSet.of(1, 2, 3));

    final ArrayList<MapAction<Integer, String>> results = ConnectorTestUtil.pushData(
        conduit, HashTrieSet.of(1, 2, 3, 4));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 4);
      Assert.assertEquals(v, k.toString());
      Assert.assertEquals(m.size(), 4);
      for (int key = 1; key <= 4; ++key) {
        Assert.assertTrue(m.containsKey(key));
        Assert.assertEquals(m.get(key).get(), Integer.toString(key));
      }
    });
  }

  @Test(dataProvider = "withState")
  public void alterExistingEntry(final boolean withState) {
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

      final MapPersister<Integer, String> persister = provider.forMap(
          "state", Form.forInteger(), Form.forString());

      final CollectionToMapConduit<Pair<Integer, String>, List<Pair<Integer, String>>, Integer, String> conduit =
          new CollectionToMapConduit<>(Pair::getFirst, Pair::getSecond, persister);

      alterExistingEntry(conduit);

      Assert.assertEquals(persister.keys(), HashTrieSet.of(1, 2, 3));
      Assert.assertEquals(persister.get(1), "a");
      Assert.assertEquals(persister.get(2), "NEW!");
      Assert.assertEquals(persister.get(3), "c");
    } else {
      final CollectionToMapConduit<Pair<Integer, String>, List<Pair<Integer, String>>, Integer, String> conduit =
          new CollectionToMapConduit<>(Pair::getFirst, Pair::getSecond, Form.forString());

      alterExistingEntry(conduit);
    }


  }

  private void alterExistingEntry(final CollectionToMapConduit<Pair<Integer, String>, List<Pair<Integer, String>>, Integer, String> conduit) {
    ConnectorTestUtil.pushData(
        conduit, Arrays.asList(pair(1, "a"), pair(2, "b"), pair(3, "c")));

    final ArrayList<MapAction<Integer, String>> results = ConnectorTestUtil.pushData(
        conduit, Arrays.asList(pair(1, "a"), pair(2, "NEW!"), pair(3, "c")));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v, "NEW!");
      Assert.assertEquals(m.size(), 3);
      Assert.assertEquals(m.get(1).get(), "a");
      Assert.assertEquals(m.get(2).get(), "NEW!");
      Assert.assertEquals(m.get(3).get(), "c");
    });
  }

  @Test(dataProvider = "withState")
  public void removeExistingEntry(final boolean withState) {
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final MapPersister<Integer, String> persister = provider.forMap(
          "state", Form.forInteger(), Form.forString());
      final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit =
          new CollectionToMapConduit<>(n -> n, Object::toString, persister);

      removeExistingEntry(conduit);

      Assert.assertEquals(persister.keys(), HashTrieSet.of(1, 3));
      Assert.assertEquals(persister.get(1), "1");
      Assert.assertEquals(persister.get(3), "3");
    } else {
      final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit =
          new CollectionToMapConduit<>(n -> n, Object::toString, Form.forString());

      removeExistingEntry(conduit);
    }

  }

  private void removeExistingEntry(final CollectionToMapConduit<Integer, Set<Integer>, Integer, String> conduit) {
    ConnectorTestUtil.pushData(
        conduit, HashTrieSet.of(1, 2, 3));

    final ArrayList<MapAction<Integer, String>> results = ConnectorTestUtil.pushData(
        conduit, HashTrieSet.of(1, 3));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectRemoval(results.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(1).get(), "1");
      Assert.assertEquals(m.get(3).get(), "3");
    });
  }

}
