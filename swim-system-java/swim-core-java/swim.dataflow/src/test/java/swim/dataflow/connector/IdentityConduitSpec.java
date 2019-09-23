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

public class IdentityConduitSpec {

  @Test
  public void propagateInput() {
    final IdentityConduit<String> conduit = new IdentityConduit<>();
    final ArrayList<String> results = ConnectorTestUtil.pushData(conduit, "Hello", "world");
    Assert.assertEquals(2, results.size());
    Assert.assertEquals("Hello", results.get(0));
    Assert.assertEquals("world", results.get(1));
  }

}
