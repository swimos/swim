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
import swim.streaming.Receptacle;
import swim.util.Deferred;

public class UnionJunctionSpec {

  @Test
  public void propagateAllInputs() {
    final int numInputs = 5;

    final UnionJunction<Integer> junction = new UnionJunction<>(numInputs);

    final ArrayList<Integer> results = new ArrayList<>(numInputs);

    final Receptacle<Integer> receptacle = n -> results.add(n.get());

    junction.subscribe(receptacle);

    for (int i = 0; i < numInputs; ++i) {
      junction.getInput(i).notifyChange(Deferred.value(i));
    }

    Assert.assertEquals(results.size(), numInputs);
    for (int i = 0; i < numInputs; ++i) {
      Assert.assertEquals(results.get(i).intValue(), i);
    }

  }

}
