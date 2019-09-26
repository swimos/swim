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

package swim.dataflow.partitions;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Supplier;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.collections.HashTrieSet;
import swim.dataflow.ConnectorTest;
import swim.streaming.persistence.MapPersister;
import swim.streaming.persistence.TrivialPersistenceProvider;
import swim.streaming.windows.PartitionAssigner;
import swim.streamlet.ConnectorUtilities;
import swim.streamlet.ConnectorUtilities.MapAction;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Value;

public class PartitionConduitSpec extends ConnectorTest {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void emitsSinglePartitionCorrectly(final boolean withState) {
    final SimplePartitionAssigner<Integer, Integer, PartitionSet<Integer>> assigner =
        SimplePartitionAssigner.ofMulti(n -> HashTrieSet.of(n % 5));

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final MapPersister<Integer, Integer> persister = provider.forMap("state", Form.forInteger(), Form.forInteger());
      final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit =
          new PartitionConduit<>(assigner, persister);
      emitsSinglePartitionCorrectly(conduit);
      Assert.assertEquals(persister.keys(), HashTrieSet.of(2));
      Assert.assertEquals(persister.get(2).intValue(), 7);
    } else {
      final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit =
          new PartitionConduit<>(assigner, Form.forInteger());

      emitsSinglePartitionCorrectly(conduit);
    }
  }

  private void emitsSinglePartitionCorrectly(final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit) {
    final ArrayList<MapAction<Integer, Integer>> results =
        ConnectorUtilities.pushData(conduit, 7);

    Assert.assertEquals(results.size(), 1);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(2).get().intValue(), 7);
    });
  }

  @Test(dataProvider = "withState")
  public void emitsTwoPartitionsCorrectly(final boolean withState) {
    final SimplePartitionAssigner<Integer, Integer, PartitionSet<Integer>> assigner =
        SimplePartitionAssigner.ofMulti(n -> HashTrieSet.of(n % 3, n % 5, n % 7));

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final MapPersister<Integer, Integer> persister = provider.forMap("state", Form.forInteger(), Form.forInteger());
      final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit =
          new PartitionConduit<>(assigner, persister);

      emitsTwoPartitionsCorrectly(conduit);

      Assert.assertEquals(persister.keys(), HashTrieSet.of(0, 1, 2));
      Assert.assertEquals(persister.get(0).intValue(), 7);
      Assert.assertEquals(persister.get(1).intValue(), 7);
      Assert.assertEquals(persister.get(2).intValue(), 7);
    } else {
      final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit =
          new PartitionConduit<>(assigner, Form.forInteger());

      emitsTwoPartitionsCorrectly(conduit);
    }
  }

  private void emitsTwoPartitionsCorrectly(final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit) {
    final ArrayList<MapAction<Integer, Integer>> results =
        ConnectorUtilities.pushData(conduit, 7);

    Assert.assertEquals(results.size(), 3);

    final HashSet<Integer> expectedParts = new HashSet<>();
    expectedParts.add(0);
    expectedParts.add(1);
    expectedParts.add(2);

    for (final MapAction<Integer, Integer> action : results) {
      expectUpdate(action, (k, v, m) -> {
        Assert.assertTrue(expectedParts.contains(k));
        expectedParts.remove(k);
        Assert.assertEquals(v.intValue(), 7);
        Assert.assertEquals(m.size(), 3);
        Assert.assertEquals(m.get(0).get().intValue(), 7);
        Assert.assertEquals(m.get(1).get().intValue(), 7);
        Assert.assertEquals(m.get(2).get().intValue(), 7);
      });
    }
  }

  @Test(dataProvider = "withState")
  public void updateExistingPartition(final boolean withState) {
    final SimplePartitionAssigner<Integer, Integer, PartitionSet<Integer>> assigner =
        SimplePartitionAssigner.ofMulti(PartitionConduitSpec::nonTrivialFactors);

    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final MapPersister<Integer, Integer> persister = provider.forMap("state", Form.forInteger(), Form.forInteger());
      final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit =
          new PartitionConduit<>(assigner, persister);

      updateExistingPartition(conduit);


      Assert.assertEquals(persister.keys(), HashTrieSet.of(2, 4));
      Assert.assertEquals(persister.get(2).intValue(), 4);
      Assert.assertEquals(persister.get(4).intValue(), 8);
    } else {
      final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit =
          new PartitionConduit<>(assigner, Form.forInteger());

      updateExistingPartition(conduit);
    }

  }

  private void updateExistingPartition(final PartitionConduit<Integer, Integer, PartitionSet<Integer>> conduit) {
    final ArrayList<MapAction<Integer, Integer>> results1 = ConnectorUtilities.pushData(conduit, 8);

    Assert.assertEquals(results1.size(), 2);

    final ArrayList<MapAction<Integer, Integer>> results2 = ConnectorUtilities.pushData(conduit, 4);

    Assert.assertEquals(results2.size(), 1);

    expectUpdate(results2.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v.intValue(), 4);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(2).get().intValue(), 4);
      Assert.assertEquals(m.get(4).get().intValue(), 8);
    });
  }

  private static Set<Integer> nonTrivialFactors(final int n) {
    HashTrieSet<Integer> facs = HashTrieSet.empty();
    for (int i = 2; i < n; ++i) {
      if (n % i == 0) {
        facs = facs.added(i);
      }
    }
    return facs;
  }

  @Test(dataProvider = "withState")
  public void removeExpiredPartition(final boolean withState) {
    final TestPartitionAssigner assigner = new TestPartitionAssigner();
    if (withState) {
      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final MapPersister<String, Record> persister = provider.forMap("state", Form.forString(), RECORD_FORM);
      final PartitionConduit<Record, String, PartitionSet<String>> conduit =
          new PartitionConduit<>(assigner, persister);

      removeExpiredPartitions(conduit);

      Assert.assertTrue(persister.keys().isEmpty());
    } else {
      final PartitionConduit<Record, String, PartitionSet<String>> conduit =
          new PartitionConduit<>(assigner, RECORD_FORM);

      removeExpiredPartitions(conduit);
    }
  }

  private void removeExpiredPartitions(final PartitionConduit<Record, String, PartitionSet<String>> conduit) {
    final ArrayList<MapAction<String, Record>> results = ConnectorUtilities.pushData(conduit,
        new Record("name", false, 2),
        new Record("name", false, 8),
        new Record("name", true, -1));

    Assert.assertEquals(results.size(), 3);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "name");
      Assert.assertEquals(v.data, 2);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("name").get().data, 2);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k, "name");
      Assert.assertEquals(v.data, 8);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("name").get().data, 8);
    });

    expectRemoval(results.get(2), (k, m) -> {
      Assert.assertEquals(k, "name");
      Assert.assertEquals(m.size(), 0);
    });
  }

  private static final class Record {
    private final String kind;
    private final boolean finished;
    private final int data;

    private Record(final String kind, final boolean finished, final int data) {
      this.kind = kind;
      this.finished = finished;
      this.data = data;
    }
  }

  private static final Form<Record> RECORD_FORM = new Form<Record>() {
    @Override
    public Class<?> type() {
      return Form.class;
    }

    @Override
    public Item mold(final Record object) {
      if (object != null) {
        return swim.structure.Record.create(1).attr("rec",
            swim.structure.Record.create(3).item(object.kind).item(object.finished).item(object.data));
      } else {
        return Value.absent();
      }
    }

    @Override
    public Record cast(final Item item) {
      if (item.isDefined()) {
        final Value asValue = item.toValue();
        final String kind = asValue.getItem(0).stringValue();
        final boolean finished = asValue.getItem(1).booleanValue();
        final int data = asValue.getItem(2).intValue();
        return new Record(kind, finished, data);
      } else {
        return null;
      }
    }
  };

  private static final class TestPartitionAssigner implements
      PartitionAssigner<Record, String, PartitionSet<String>> {

    @Override
    public Supplier<PartitionSet<String>> stateFactory() {
      return PartitionSet::new;
    }

    @Override
    public Assignment<String, PartitionSet<String>> partitionsFor(final Record data,
                                                                  final PartitionSet<String> partState) {
      final String part = data.kind;
      if (!data.finished) {

        final PartitionSet<String> newState =
            partState.activePartitions().contains(part) ? partState : partState.addPartition(part);
        return new Assignment<String, PartitionSet<String>>() {
          @Override
          public Set<String> partitions() {
            return Collections.singleton(part);
          }

          @Override
          public PartitionSet<String> updatedState() {
            return newState;
          }
        };
      } else {
        final PartitionSet<String> newState =
            partState.activePartitions().contains(part) ? partState.removePartition(part) : partState;
        return new Assignment<String, PartitionSet<String>>() {
          @Override
          public Set<String> partitions() {
            return Collections.emptySet();
          }

          @Override
          public PartitionSet<String> updatedState() {
            return newState;
          }
        };
      }
    }
  }

}
