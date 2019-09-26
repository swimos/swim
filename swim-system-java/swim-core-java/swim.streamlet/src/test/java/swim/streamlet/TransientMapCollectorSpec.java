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
import swim.util.Pair;

public class TransientMapCollectorSpec extends ConnectorTest {

  @Test
  public void accumulateEntries() {

    final TransientMapCollector<Pair<Integer, Integer>, Integer, Integer> collector =
        new TransientMapCollector<>(Pair::getFirst, Pair::getSecond);

    final ArrayList<ConnectorUtilities.MapAction<Integer, Integer>> results = ConnectorUtilities.pushData(
        collector, Pair.pair(1, 2), Pair.pair(3, 3), Pair.pair(4, 5));

    Assert.assertEquals(results.size(), 3);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 1);
      Assert.assertEquals(v.intValue(), 2);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(1).get().intValue(), 2);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 3);
      Assert.assertEquals(v.intValue(), 3);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(1).get().intValue(), 2);
      Assert.assertEquals(m.get(3).get().intValue(), 3);
    });

    expectUpdate(results.get(2), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 4);
      Assert.assertEquals(v.intValue(), 5);
      Assert.assertEquals(m.size(), 3);
      Assert.assertEquals(m.get(1).get().intValue(), 2);
      Assert.assertEquals(m.get(3).get().intValue(), 3);
      Assert.assertEquals(m.get(4).get().intValue(), 5);
    });
  }

}
