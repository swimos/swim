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

import static org.testng.Assert.assertEquals;

public final class Assertions {
  private Assertions() {
    // stub
  }

  public static void assertParses(String recon, Envelope envelope) {
    assertEquals(Envelope.parseRecon(recon), envelope);
  }

  public static void assertWrites(Envelope envelope, String recon) {
    assertEquals(envelope.toRecon(), recon);
  }
}
