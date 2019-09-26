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

public class TransformMapStreamletSpec extends ConnectorTest {

  @Test
  public void transformInput() {

    final TransformMapStreamlet<Integer, Integer, Integer> streamlet =
        new TransformMapStreamlet<>((k, v) -> k * v);

    final ConnectorUtilities.ActionAccumulator<Integer, Integer> acc =
        new ConnectorUtilities.ActionAccumulator<>();

    final ArrayList<ConnectorUtilities.MapAction<Integer, Integer>> results = ConnectorUtilities.pushData(
        streamlet, acc.update(2, 3), acc.update(4, 7));

    Assert.assertEquals(results.size(), 2);

    expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v.intValue(), 6);
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(2).get().intValue(), 6);
    });

    expectUpdate(results.get(1), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 4);
      Assert.assertEquals(v.intValue(), 28);
      Assert.assertEquals(m.size(), 2);
      Assert.assertEquals(m.get(2).get().intValue(), 6);
      Assert.assertEquals(m.get(4).get().intValue(), 28);
    });
  }

}
