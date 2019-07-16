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

package swim.warp;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Record;
import static swim.warp.Assertions.assertParses;
import static swim.warp.Assertions.assertWrites;

public class DeauthedResponseSpec {
  @Test
  public void parseDeauthed() {
    assertParses("@deauthed", new DeauthedResponse());
  }

  @Test
  public void parseDeauthedWithBody() {
    assertParses("@deauthed@test", new DeauthedResponse(Record.of(Attr.of("test"))));
  }

  @Test
  public void writeDeauthed() {
    assertWrites(new DeauthedResponse(), "@deauthed");
  }

  @Test
  public void writeDeauthedWithBody() {
    assertWrites(new DeauthedResponse(Record.of(Attr.of("test"))), "@deauthed@test");
  }
}
