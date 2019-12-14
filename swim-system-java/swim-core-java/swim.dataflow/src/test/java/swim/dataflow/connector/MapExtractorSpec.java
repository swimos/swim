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
import java.util.Map;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.HashTrieMap;

public class MapExtractorSpec {

  @Test
  public void extractStateAsEntries() {
    final MapExtractor<Integer, Integer> extractor = new MapExtractor<>();

    final ConnectorTestUtil.ActionAccumulator<Integer, Integer> acc =
        new ConnectorTestUtil.ActionAccumulator<>();

    final ArrayList<Map<Integer, Integer>> results = ConnectorTestUtil.pushData(
        extractor, acc.update(1, 2), acc.update(2, 3), acc.update(3, 4), acc.remove(2));

    Assert.assertEquals(results.size(), 4);
    final HashTrieMap<Integer, Integer> expected1 = HashTrieMap.<Integer, Integer>empty().updated(1, 2);
    Assert.assertEquals(results.get(0), expected1);
    final HashTrieMap<Integer, Integer> expected2 = expected1.updated(2, 3);
    Assert.assertEquals(results.get(1), expected2);
    final HashTrieMap<Integer, Integer> expected3 = expected2.updated(3, 4);
    Assert.assertEquals(results.get(2), expected3);
    final HashTrieMap<Integer, Integer> expected4 = expected3.removed(2);
    Assert.assertEquals(results.get(3), expected4);
  }

}
