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

package swim.dataflow.graph.impl.windows;

import org.testng.Assert;
import org.testng.annotations.Test;
import swim.collections.BTreeMap;
import swim.util.Unit;

public class ReducingEvaluatorSpec {

  @Test
  public void reducesValuesCorrectly() {

    final ReducingEvaluator<Long, Integer, Unit, Integer> eval = new ReducingEvaluator<>(
        u -> Integer.MIN_VALUE, (w, s, n) -> Math.max(s, n),
        (w, s1, s2) -> Math.max(s1, s2));

    final BTreeMap<Long, Integer, Integer> map = BTreeMap.<Long, Integer, Integer>empty()
        .updated(100L, 5)
        .updated(200L, 65)
        .updated(300L, -1)
        .updated(400L, 47);

    final int result = eval.evaluate(Unit.INSTANCE, map);

    Assert.assertEquals(result, 65);

    final BTreeMap<Long, Integer, Integer> map2 = map.removed(200L);

    final int result2 = eval.evaluate(Unit.INSTANCE, map2);

    Assert.assertEquals(result2, 47);
  }

}
