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
import swim.dataflow.connector.ConnectorTestUtil.Parity;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.structure.Form;
import static swim.dataflow.graph.Either.left;
import static swim.dataflow.graph.Either.right;

public class ModalFilteredConduitSpec {

  @Test
  public void filterByMode() {
    final ModalFilteredConduit<Integer, Parity> conduit = new ModalFilteredConduit<>(
        Parity.EVEN, parity -> n -> n % 2 == parity.ordinal());

    final ArrayList<Integer> results = ConnectorTestUtil.pushData(
        conduit, left(2), left(7), right(Parity.ODD), left(2), left(13));

    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(0).intValue(), 2);
    Assert.assertEquals(results.get(1).intValue(), 13);
  }

  @Test
  public void filterByModeWithState() {

    final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();

    final ValuePersister<Parity> modePersister = provider.forValue("mode",
        Form.forEnum(Parity.class), Parity.EVEN);

    final ModalFilteredConduit<Integer, Parity> conduit = new ModalFilteredConduit<>(
        modePersister, (Parity parity) -> (Integer n) -> n % 2 == parity.ordinal());

    final ArrayList<Integer> results = ConnectorTestUtil.pushData(
        conduit, left(2), left(7), right(Parity.ODD), left(2), left(13));

    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(0).intValue(), 2);
    Assert.assertEquals(results.get(1).intValue(), 13);

    Assert.assertEquals(modePersister.get(), Parity.ODD);
  }

}
