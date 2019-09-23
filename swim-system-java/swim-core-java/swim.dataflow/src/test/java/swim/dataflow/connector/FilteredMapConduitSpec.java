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
import swim.dataflow.connector.ConnectorTestUtil.MapAction;

public class FilteredMapConduitSpec {

  @Test
  public void filterOutInputData() {
    final FilteredMapConduit<Integer, String> conduit =
        new FilteredMapConduit<>((k, v) -> v.length() <= k);

    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    final ArrayList<MapAction<Integer, String>> results =
        ConnectorTestUtil.pushData(conduit, acc.update(2, "a"));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectUpdate(results.get(0), (k, v, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(v, "a");
      Assert.assertEquals(m.size(), 1);
      Assert.assertEquals(m.get(k).get(), "a");
    });

    final ArrayList<MapAction<Integer, String>> results2 =
        ConnectorTestUtil.pushData(conduit,
            acc.update(1, "aaa"));

    Assert.assertEquals(results2.size(), 0);
  }

  @Test
  public void filterPreviouslyAdmittedKey() {
    final FilteredMapConduit<Integer, String> conduit =
        new FilteredMapConduit<>((k, v) -> v.length() <= k);

    final ActionAccumulator<Integer, String> acc =
        new ActionAccumulator<>();

    ConnectorTestUtil.pushData(conduit, acc.update(2, "a"));

    final ArrayList<MapAction<Integer, String>> results =
        ConnectorTestUtil.pushData(conduit, acc.update(2, "aaa"));

    Assert.assertEquals(results.size(), 1);

    ConnectorTestUtil.expectRemoval(results.get(0), (k, m) -> {
      Assert.assertEquals(k.intValue(), 2);
      Assert.assertEquals(m.size(), 0);
    });
  }

}
