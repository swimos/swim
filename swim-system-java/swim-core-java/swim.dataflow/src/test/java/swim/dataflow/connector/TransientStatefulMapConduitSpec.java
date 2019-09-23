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
import swim.collections.FingerTrieSeq;
import static swim.dataflow.graph.Either.left;
import static swim.dataflow.graph.Either.right;

public class TransientStatefulMapConduitSpec {

  @Test
  public void foldInputs() {

    final TransientStatefulMapConduit<String, Integer, FingerTrieSeq<Integer>> conduit = StatefulConduits.foldMap(
        FingerTrieSeq.empty(), FingerTrieSeq::appended);

    final ConnectorTestUtil.ActionAccumulator<String, Integer> acc =
        new ConnectorTestUtil.ActionAccumulator<>();

    final ArrayList<ConnectorTestUtil.MapAction<String, FingerTrieSeq<Integer>>> results = ConnectorTestUtil.pushData(
        conduit,
        acc.update("a", 1),
        acc.update("a", 2),
        acc.update("a", 3),
        acc.update("b", 4),
        acc.remove("a"));

    Assert.assertEquals(results.size(), 5);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    ConnectorTestUtil.expectUpdate(results.get(1), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1, 2);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    ConnectorTestUtil.expectUpdate(results.get(2), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1, 2, 3);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    ConnectorTestUtil.expectUpdate(results.get(3), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(4);
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get(), FingerTrieSeq.of(1, 2, 3));
      Assert.assertEquals(m.get("b").get(), FingerTrieSeq.of(4));
    });

    ConnectorTestUtil.expectRemoval(results.get(4), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("b").get(), FingerTrieSeq.of(4));
    });
  }

  @Test
  public void reduceInputs() {
    final TransientStatefulMapConduit<String, Integer, Integer> conduit = StatefulConduits.reduceMap(Math::min);

    final ConnectorTestUtil.ActionAccumulator<String, Integer> acc =
        new ConnectorTestUtil.ActionAccumulator<>();

    final ArrayList<ConnectorTestUtil.MapAction<String, Integer>> results = ConnectorTestUtil.pushData(conduit,
        acc.update("a", 35),
        acc.update("b", 76),
        acc.update("a", 12),
        acc.update("b", 7),
        acc.update("b", 99));

    Assert.assertEquals(results.size(), 5);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 35);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 35);
    });

    ConnectorTestUtil.expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 76);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 35);
      Assert.assertEquals(m.get("b").get().intValue(), 76);
    });

    ConnectorTestUtil.expectUpdate(results.get(2), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 12);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 12);
      Assert.assertEquals(m.get("b").get().intValue(), 76);
    });

    ConnectorTestUtil.expectUpdate(results.get(3), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 12);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });

    ConnectorTestUtil.expectUpdate(results.get(4), (k, v, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v.intValue(), 7);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get().intValue(), 12);
      Assert.assertEquals(m.get("b").get().intValue(), 7);
    });
  }

  @Test
  public void foldInputsModally() {
    final TransientModalStatefulMapConduit<String, Integer, ConnectorTestUtil.Parity, FingerTrieSeq<Integer>> conduit =
        StatefulConduits.modalFoldMap(ConnectorTestUtil.Parity.ODD, FingerTrieSeq.empty(),
            p -> (seq, n) -> (n % 2) == p.ordinal() ? seq.appended(n) : seq);

    final ConnectorTestUtil.ActionAccumulator<String, Integer> acc =
        new ConnectorTestUtil.ActionAccumulator<>();

    final ArrayList<ConnectorTestUtil.MapAction<String, FingerTrieSeq<Integer>>> results = ConnectorTestUtil.pushData(
        conduit,
        left(acc.update("a", 1)),
        left(acc.update("b", 2)),
        right(ConnectorTestUtil.Parity.EVEN),
        left(acc.remove("b")),
        left(acc.update("a", 3)),
        left(acc.update("a", 4)));

    Assert.assertEquals(results.size(), 5);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    ConnectorTestUtil.expectUpdate(results.get(1), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.empty();
      Assert.assertEquals(k, "b");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get("a").get(), FingerTrieSeq.of(1));
      Assert.assertEquals(m.get("b").get(), expected);
    });

    ConnectorTestUtil.expectRemoval(results.get(2), (k, m) -> {
      Assert.assertEquals(k, "b");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), FingerTrieSeq.of(1));
    });

    ConnectorTestUtil.expectUpdate(results.get(3), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

    ConnectorTestUtil.expectUpdate(results.get(4), (k, v, m) -> {
      final FingerTrieSeq<Integer> expected = FingerTrieSeq.of(1, 4);
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v, expected);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get(), expected);
    });

  }

  @Test
  public void reduceInputsModally() {
    final TransientModalStatefulMapConduit<String, Integer, ConnectorTestUtil.Multiple, Integer> conduit =
        StatefulConduits.modalReduceMap(ConnectorTestUtil.Multiple.DOUBLE, m -> (sum, n) -> sum * m.getFactor() + n);

    final ConnectorTestUtil.ActionAccumulator<String, Integer> acc =
        new ConnectorTestUtil.ActionAccumulator<>();

    final ArrayList<ConnectorTestUtil.MapAction<String, Integer>> results = ConnectorTestUtil.pushData(
        conduit,
        left(acc.update("a", 1)),
        left(acc.update("a", 2)),
        right(ConnectorTestUtil.Multiple.TRIPLE),
        left(acc.update("a", 3)),
        left(acc.remove("a")),
        left(acc.update("a", 4)));

    Assert.assertEquals(results.size(), 5);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 1);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 1);
    });

    ConnectorTestUtil.expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 4);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 4);
    });

    ConnectorTestUtil.expectUpdate(results.get(2), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 15);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 15);
    });

    ConnectorTestUtil.expectRemoval(results.get(3), (k, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(m.size(), 0);
    });

    ConnectorTestUtil.expectUpdate(results.get(4), (k, v, m) -> {
      Assert.assertEquals(k, "a");
      Assert.assertEquals(v.intValue(), 4);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get("a").get().intValue(), 4);
    });
  }

}
