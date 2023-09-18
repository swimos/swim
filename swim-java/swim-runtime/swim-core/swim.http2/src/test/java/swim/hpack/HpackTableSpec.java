// Copyright 2015-2023 Nstream, inc.
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

package swim.hpack;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class HpackTableSpec {

  @Test
  public void lookupStaticEntriesByName() {
    final HpackTableStatic staticTable = HpackTableStatic.standard();
    assertEquals(staticTable.getIndex(":authority"), 1);
    assertEquals(staticTable.getIndex(":method"), 2);
    assertEquals(staticTable.getIndex(":path"), 4);
    assertEquals(staticTable.getIndex(":scheme"), 6);
    assertEquals(staticTable.getIndex(":status"), 8);
    assertEquals(staticTable.getIndex("www-authenticate"), 61);
  }

}
