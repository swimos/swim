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
import swim.streamlet.ConnectorTest.Multiple;
import swim.streamlet.ConnectorTest.Parity;
import swim.util.Either;

public class TransientStatefulStreamletSpec {

  @Test
  public void foldInputs() {

    final TransientStatefulStreamlet<Integer, FingerTrieSeq<Integer>> streamlet = StatefulStreamlets.fold(
        FingerTrieSeq.empty(), FingerTrieSeq::appended);

    final ArrayList<FingerTrieSeq<Integer>> results = ConnectorUtilities.pushData(streamlet, 1, 2, 3, 4);

    Assert.assertEquals(results.size(), 4);
    Assert.assertEquals(results.get(0), FingerTrieSeq.of(1));
    Assert.assertEquals(results.get(1), FingerTrieSeq.of(1, 2));
    Assert.assertEquals(results.get(2), FingerTrieSeq.of(1, 2, 3));
    Assert.assertEquals(results.get(3), FingerTrieSeq.of(1, 2, 3, 4));
  }

  @Test
  public void reduceInputs() {
    final TransientStatefulStreamlet<Integer, Integer> streamlet = StatefulStreamlets.reduce(Math::min);
    final ArrayList<Integer> results = ConnectorUtilities.pushData(streamlet, 35, 76, 12, 7);
    Assert.assertEquals(results.size(), 4);
    Assert.assertEquals(results.get(0).intValue(), 35);
    Assert.assertEquals(results.get(1).intValue(), 35);
    Assert.assertEquals(results.get(2).intValue(), 12);
    Assert.assertEquals(results.get(3).intValue(), 7);
  }

  @Test
  public void foldInputsModally() {
    final TransientModalStatefulStreamlet<Integer, Parity, FingerTrieSeq<Integer>> streamlet = StatefulStreamlets.modalFold(Parity.ODD,
        FingerTrieSeq.empty(), p -> (seq, n) ->
            (n % 2) == p.ordinal() ? seq.appended(n) : seq);

    final ArrayList<FingerTrieSeq<Integer>> results = ConnectorUtilities.pushData(
        streamlet, Either.left(1), Either.left(2), Either.right(Parity.EVEN), Either.left(3), Either.left(4));

    Assert.assertEquals(results.size(), 4);
    Assert.assertEquals(results.get(0), FingerTrieSeq.of(1));
    Assert.assertEquals(results.get(1), FingerTrieSeq.of(1));
    Assert.assertEquals(results.get(2), FingerTrieSeq.of(1));
    Assert.assertEquals(results.get(3), FingerTrieSeq.of(1, 4));
  }

  @Test
  public void reduceInputsModally() {
    final TransientModalStatefulStreamlet<Integer, Multiple, Integer> streamlet =
        StatefulStreamlets.modalReduce(Multiple.DOUBLE, m -> (sum, n) -> sum * m.getFactor() + n);

    final ArrayList<Integer> results = ConnectorUtilities.pushData(
        streamlet, Either.left(1), Either.left(2), Either.right(Multiple.TRIPLE), Either.left(3), Either.left(4));

    Assert.assertEquals(results.size(), 4);
    Assert.assertEquals(results.get(0).intValue(), 1);
    Assert.assertEquals(results.get(1).intValue(), 4);
    Assert.assertEquals(results.get(2).intValue(), 15);
    Assert.assertEquals(results.get(3).intValue(), 49);
  }

}
