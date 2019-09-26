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
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import swim.streaming.persistence.TrivialPersistenceProvider;
import swim.streaming.persistence.ValuePersister;
import swim.streamlet.ConnectorTest.Multiple;
import swim.structure.Form;
import swim.util.Either;

public class ModalTransformConduitSpec {

  @DataProvider(name = "withState")
  public Object[][] withOrWithoutState() {
    return new Object[][] {{true}, {false}};
  }

  @Test(dataProvider = "withState")
  public void transformByMode(final boolean withState) {
    if (withState) {

      final TrivialPersistenceProvider provider = new TrivialPersistenceProvider();
      final ValuePersister<Multiple> modePersister = provider.forValue("mode",
          Form.forEnum(Multiple.class), Multiple.DOUBLE);

      final ModalTransformConduit<Integer, Integer, Multiple> conduit = new ModalTransformConduit<>(
          modePersister,
          (Multiple m) -> (Integer n) -> m.getFactor() * n);

      transformByMode(conduit);

      Assert.assertEquals(modePersister.get(), Multiple.TRIPLE);
    } else {
      final ModalTransformConduit<Integer, Integer, Multiple> conduit = new ModalTransformConduit<>(
          Multiple.DOUBLE, m -> n -> m.getFactor() * n);

      transformByMode(conduit);
    }
  }

  private void transformByMode(final ModalTransformConduit<Integer, Integer, Multiple> conduit) {
    final ArrayList<Integer> results = ConnectorUtilities.pushData(conduit, Either.left(5), Either.right(Multiple.TRIPLE), Either.left(2));
    Assert.assertEquals(results.size(), 2);
    Assert.assertEquals(results.get(0).intValue(), 10);
    Assert.assertEquals(results.get(1).intValue(), 6);
  }


}
