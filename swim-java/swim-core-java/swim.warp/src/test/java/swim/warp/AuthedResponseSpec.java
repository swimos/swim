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

public class AuthedResponseSpec {
  @Test
  public void parseAuthed() {
    assertParses("@authed", new AuthedResponse());
  }

  @Test
  public void parseAuthedWithBody() {
    assertParses("@authed@test", new AuthedResponse(Record.of(Attr.of("test"))));
  }

  @Test
  public void writeAuthed() {
    assertWrites(new AuthedResponse(), "@authed");
  }

  @Test
  public void writeAuthedWithBody() {
    assertWrites(new AuthedResponse(Record.of(Attr.of("test"))), "@authed@test");
  }
}
