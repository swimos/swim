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
import swim.dataflow.connector.ConnectorTestUtil.Multiple;
import swim.dataflow.connector.ConnectorTestUtil.Parity;
import static swim.dataflow.graph.Either.left;
import static swim.dataflow.graph.Either.right;

public class TransientStatefulConduitSpec {

  @Test
  public void foldInputs() {

    final TransientStatefulConduit<Integer, FingerTrieSeq<Integer>> conduit = StatefulConduits.fold(
        FingerTrieSeq.empty(), FingerTrieSeq::appended);

    final ArrayList<FingerTrieSeq<Integer>> results = ConnectorTestUtil.pushData(conduit, 1, 2, 3, 4);

    Assert.assertEquals(results.size(), 4);
    Assert.assertEquals(results.get(0), FingerTrieSeq.of(1));
    Assert.assertEquals(results.get(1), FingerTrieSeq.of(1, 2));
    Assert.assertEquals(results.get(2), FingerTrieSeq.of(1, 2, 3));
    Assert.assertEquals(results.get(3), FingerTrieSeq.of(1, 2, 3, 4));
  }

  @Test
  public void reduceInputs() {
    final TransientStatefulConduit<Integer, Integer> conduit = StatefulConduits.reduce(Math::min);
    final ArrayList<Integer> results = ConnectorTestUtil.pushData(conduit, 35, 76, 12, 7);
    Assert.assertEquals(results.size(), 4);
    Assert.assertEquals(results.get(0).intValue(), 35);
    Assert.assertEquals(results.get(1).intValue(), 35);
    Assert.assertEquals(results.get(2).intValue(), 12);
    Assert.assertEquals(results.get(3).intValue(), 7);
  }

  @Test
  public void foldInputsModally() {
    final TransientModalStatefulConduit<Integer, Parity, FingerTrieSeq<Integer>> conduit = StatefulConduits.modalFold(Parity.ODD,
        FingerTrieSeq.empty(), p -> (seq, n) ->
            (n % 2) == p.ordinal() ? seq.appended(n) : seq);

    final ArrayList<FingerTrieSeq<Integer>> results = ConnectorTestUtil.pushData(
        conduit, left(1), left(2), right(Parity.EVEN), left(3), left(4));

    Assert.assertEquals(results.size(), 4);
    Assert.assertEquals(results.get(0), FingerTrieSeq.of(1));
    Assert.assertEquals(results.get(1), FingerTrieSeq.of(1));
    Assert.assertEquals(results.get(2), FingerTrieSeq.of(1));
    Assert.assertEquals(results.get(3), FingerTrieSeq.of(1, 4));
  }

  @Test
  public void reduceInputsModally() {
    final TransientModalStatefulConduit<Integer, Multiple, Integer> conduit =
        StatefulConduits.modalReduce(Multiple.DOUBLE, m -> (sum, n) -> sum * m.getFactor() + n);

    final ArrayList<Integer> results = ConnectorTestUtil.pushData(
        conduit, left(1), left(2), right(Multiple.TRIPLE), left(3), left(4));

    Assert.assertEquals(results.size(), 4);
    Assert.assertEquals(results.get(0).intValue(), 1);
    Assert.assertEquals(results.get(1).intValue(), 4);
    Assert.assertEquals(results.get(2).intValue(), 15);
    Assert.assertEquals(results.get(3).intValue(), 49);
  }

}
