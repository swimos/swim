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
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class FilteredConduitSpec {

  @Test
  public void correctlyFilterInput() {
    final FilteredConduit<Integer> conduit = new FilteredConduit<>(n -> (n % 2) == 0);
    final ArrayList<Integer> results = ConnectorUtilities.pushData(conduit, 6, 13, 7, 20);
    assertEquals(results.size(), 2);
    assertEquals(results.get(0).intValue(), 6);
    assertEquals(results.get(1).intValue(), 20);
  }

}
