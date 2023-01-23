// Copyright 2015-2023 Swim.inc
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

package swim.math;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Record;
import static org.testng.Assert.assertEquals;

public class R3VectorSpec {

  @Test
  public void testMold() {
    assertEquals(R3Vector.form().mold(new R3Vector(2.0, 0.5, -1.0)),
                 Record.of(Attr.of("vector", Record.of(2.0, 0.5, -1.0))));
  }

  @Test
  public void testCast() {
    assertEquals(R3Vector.form().cast(Record.of(Attr.of("vector", Record.of(2.0, 0.5, -1.0)))),
                 new R3Vector(2.0, 0.5, -1.0));
  }

}
