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
import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialValuePersister;
import swim.dataflow.graph.persistence.ValuePersister;

public class FirstValueConduitSpec {

  @Test
  public void emitsTheFirstValue() {
    final FirstValueConduit<Integer> conduit = new FirstValueConduit<>();
    final ArrayList<Integer> results = ConnectorTestUtil.pushData(conduit, 2);

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0).intValue(), 2);
  }

  @Test
  public void doesNotEmitValuesAfterFirst() {
    final FirstValueConduit<Integer> conduit = new FirstValueConduit<>();
    final ArrayList<Integer> results = ConnectorTestUtil.pushData(conduit, 2);

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0).intValue(), 2);

    final ArrayList<Integer> results2 = ConnectorTestUtil.pushData(conduit, 5, 6);

    Assert.assertTrue(results2.isEmpty());
  }

  @Test
  public void restoresFromState() {
    final FirstValueConduit<Integer> conduit = new FirstValueConduit<>(new TrivialValuePersister<>(8));

    final ArrayList<Integer> results = ConnectorTestUtil.pushData(conduit, 6, 4, 5);

    Assert.assertTrue(results.isEmpty());
  }

  @Test
  public void storesInState() {
    final ValuePersister<Integer> state = new TrivialValuePersister<>(null);
    final FirstValueConduit<Integer> conduit = new FirstValueConduit<>(state);
    final ArrayList<Integer> results = ConnectorTestUtil.pushData(conduit, 2);

    Assert.assertEquals(results.size(), 1);
    Assert.assertEquals(results.get(0).intValue(), 2);

    Assert.assertEquals(state.get().intValue(), 2);

  }

}
