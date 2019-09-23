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
import swim.dataflow.connector.ConnectorTestUtil.ActionAccumulator;

public class ReduceFieldsConduitSpec {

  @Test
  public void addValuesToReduction() {
    final ReduceFieldsConduit<Long, Integer, Integer> conduit = new ReduceFieldsConduit<>(
        0, Integer::sum, Integer::sum);

    final ActionAccumulator<Long, Integer> acc = new ActionAccumulator<>();

    final ArrayList<Integer> outputs = ConnectorTestUtil.pushData(conduit,
        acc.update(1000L, 5),
        acc.update(2000L, 7));

    Assert.assertEquals(outputs.size(), 2);
    Assert.assertEquals(outputs.get(0).intValue(), 5);
    Assert.assertEquals(outputs.get(1).intValue(), 12);
  }

  @Test
  public void replaceValueInReduction() {
    final ReduceFieldsConduit<Long, Integer, Integer> conduit = new ReduceFieldsConduit<>(
        0, Integer::sum, Integer::sum);

    final ActionAccumulator<Long, Integer> acc = new ActionAccumulator<>();

    ConnectorTestUtil.pushData(conduit,
        acc.update(1000L, 5),
        acc.update(2000L, 7));

    final ArrayList<Integer> outputs = ConnectorTestUtil.pushData(conduit, acc.update(1000L, -3));

    Assert.assertEquals(outputs.size(), 1);
    Assert.assertEquals(outputs.get(0).intValue(), 4);
  }

  @Test
  public void removeValueFromReduction() {
    final ReduceFieldsConduit<Long, Integer, Integer> conduit = new ReduceFieldsConduit<>(
        0, Integer::sum, Integer::sum);

    final ActionAccumulator<Long, Integer> acc = new ActionAccumulator<>();

    ConnectorTestUtil.pushData(conduit,
        acc.update(1000L, 5),
        acc.update(2000L, 7));

    final ArrayList<Integer> outputs = ConnectorTestUtil.pushData(conduit, acc.remove(1000L));

    Assert.assertEquals(outputs.size(), 1);
    Assert.assertEquals(outputs.get(0).intValue(), 7);
  }

}
