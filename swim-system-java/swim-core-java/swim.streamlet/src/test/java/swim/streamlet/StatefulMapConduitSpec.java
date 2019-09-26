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
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieSet;
import swim.streaming.persistence.MapPersister;
import swim.streaming.persistence.TrivialPersistenceProvider;
import swim.streaming.persistence.ValuePersister;
import swim.structure.Form;
import swim.structure.form.FingerTrieSeqForm;
import swim.util.Either;

public class StatefulMapConduitSpec extends ConnectorTest {

  @Test
  public void foldInputs() {

    final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

    final MapPersister<String, FingerTrieSeq<Integer>> persister =
        provider.forMap("state", Form.forString(), new FingerTrieSeqForm<>(Form.forInteger()), FingerTrieSeq.empty());

    final MapConduit<String, String, Integer, FingerTrieSeq<Integer>> conduit = StatefulConduits.foldMapPersistent(
        persister, FingerTrieSeq::appended);

    final ConnectorUtilities.ActionAccumulator<String, Integer> acc =
        new ConnectorUtilities.ActionAccumulator<>();

    final ArrayList<ConnectorUtilities.MapAction<String, FingerTrieSeq<Integer>>> results = ConnectorUtilities.pushData(
        conduit,
        acc.update("a", 1),
        acc.update("a", 2),
        acc.update("a", 3),
        acc.update("b", 4),
        acc.remove("a"));

    Assert.assertEquals(results.size(), 5);

    expectUpdate(results.get(0), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1, 2);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    expectUpdate(results.get(2), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1, 2, 3);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    expectUpdate(results.get(3), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(4);
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get(), FingerTrieSeq.of(1, 2, 3));
      Assert.assertEquals(m.get("b").get(), FingerTrieSeq.of(4));
    });

    expectRemoval(results.get(4), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("b").get(), FingerTrieSeq.of(4));
    });

    Assert.assertEquals(persister.keys(), HashTrieSet.of("b"));
    Assert.assertEquals(persister.get("b"), FingerTrieSeq.of(4));
  }

  @Test
  public void reduceInputs() {

    final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

    final MapPersister<String, Integer> persister =
        provider.forMap("state", Form.forString(), Form.forInteger(), null);

    final StatefulMapConduit<String, Integer, Integer> conduit = StatefulConduits.reduceMap(persister, Math::min);

    final ConnectorUtilities.ActionAccumulator<String, Integer> acc =
        new ConnectorUtilities.ActionAccumulator<>();

    final ArrayList<ConnectorUtilities.MapAction<String, Integer>> results = ConnectorUtilities.pushData(conduit,
        acc.update("a", 35),
        acc.update("b", 76),
        acc.update("a", 12),
        acc.update("b", 7),
        acc.update("b", 99));

    Assert.assertEquals(results.size(), 5);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 35);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 35);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 76);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 35);
      Assert.assertEquals(m.get("b").get().intValue(), 76);
    });

    expectUpdate(results.get(2), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 12);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 12);
      Assert.assertEquals(m.get("b").get().intValue(), 76);
    });

    expectUpdate(results.get(3), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 12);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });

    expectUpdate(results.get(4), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 12);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });

    Assert.assertEquals(persister.keys(), HashTrieSet.of("a", "b"));
    Assert.assertEquals(persister.get("a").intValue(), 12);
    Assert.assertEquals(persister.get("b").intValue(), 7);
  }

  @Test
  public void foldInputsModally() {

    final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

    final ValuePersister<Parity> modePersister = provider.forValue("mode",
        Form.forEnum(Parity.class), Parity.ODD);

    final MapPersister<String, FingerTrieSeq<Integer>> persister =
        provider.forMap("state", Form.forString(), new FingerTrieSeqForm<>(Form.forInteger()), FingerTrieSeq.empty());

    final ModalStatefulMapConduit<String, Integer, Parity, FingerTrieSeq<Integer>> conduit =
        StatefulConduits.modalFoldMap(modePersister, persister,
            (Parity p) -> (FingerTrieSeq<Integer> seq, Integer n) -> (n % 2) == p.ordinal() ? seq.appended(n) : seq);

    final ConnectorUtilities.ActionAccumulator<String, Integer> acc =
        new ConnectorUtilities.ActionAccumulator<>();

    final ArrayList<ConnectorUtilities.MapAction<String, FingerTrieSeq<Integer>>> results = ConnectorUtilities.pushData(
        conduit,
        Either.left(acc.update("a", 1)),
        Either.left(acc.update("b", 2)),
        Either.right(Parity.EVEN),
        Either.left(acc.remove("b")),
        Either.left(acc.update("a", 3)),
        Either.left(acc.update("a", 4)));

    Assert.assertEquals(results.size(), 5);

    expectUpdate(results.get(0), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.empty();
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get(), FingerTrieSeq.of(1));
      Assert.assertEquals(m.get("b").get(), expected);
    });

    expectRemoval(results.get(2), (k, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), FingerTrieSeq.of(1));
    });

    expectUpdate(results.get(3), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    expectUpdate(results.get(4), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1, 4);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    Assert.assertEquals(modePersister.get(), Parity.EVEN);
    Assert.assertEquals(persister.keys(), HashTrieSet.of("a"));
    Assert.assertEquals(persister.get("a"), FingerTrieSeq.of(1, 4));
  }

  @Test
  public void reduceInputsModally() {

    final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

    final ValuePersister<Multiple> modePersister = provider.forValue("mode",
        Form.forEnum(Multiple.class), Multiple.DOUBLE);

    final MapPersister<String, Integer> persister =
        provider.forMap("state", Form.forString(), Form.forInteger(), null);

    final ModalStatefulMapConduit<String, Integer, Multiple, Integer> conduit =
        StatefulConduits.modalReduceMap(modePersister, persister, m -> (sum, n) -> sum * m.getFactor() + n);

    final ConnectorUtilities.ActionAccumulator<String, Integer> acc =
        new ConnectorUtilities.ActionAccumulator<>();

    final ArrayList<ConnectorUtilities.MapAction<String, Integer>> results = ConnectorUtilities.pushData(
        conduit,
        Either.left(acc.update("a", 1)),
        Either.left(acc.update("a", 2)),
        Either.right(Multiple.TRIPLE),
        Either.left(acc.update("a", 3)),
        Either.left(acc.remove("a")),
        Either.left(acc.update("a", 4)));

    Assert.assertEquals(results.size(), 5);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 4);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 4);
    });

    expectUpdate(results.get(2), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 15);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 15);
    });

    expectRemoval(results.get(3), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });

    expectUpdate(results.get(4), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 4);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 4);
    });

    Assert.assertEquals(modePersister.get(), Multiple.TRIPLE);
    Assert.assertEquals(persister.keys(), HashTrieSet.of("a"));
    Assert.assertEquals(persister.get("a").intValue(), 4);
  }

}
