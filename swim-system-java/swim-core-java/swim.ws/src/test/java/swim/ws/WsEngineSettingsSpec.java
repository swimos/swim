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

package swim.ws;

import org.testng.annotations.Test;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class WsEngineSettingsSpec {
  @Test
  public void decodeStandardEngineSettings() {
    assertDecodes(Record.empty(), WsEngineSettings.standard());
  }

  @Test
  public void decodeCustomEngineSettings() {
    assertDecodes(Record.of(Slot.of("maxFrameSize", 2048),
                            Slot.of("maxMessageSize", 4096),
                            Slot.of("serverCompressionLevel", 7),
                            Slot.of("clientCompressionLevel", 9),
                            Slot.of("serverNoContextTakeover", true),
                            Slot.of("clientNoContextTakeover", true),
                            Slot.of("serverMaxWindowBits", 11),
                            Slot.of("clientMaxWindowBits", 13)),
                  WsEngineSettings.standard().maxFrameSize(2048)
                                             .maxMessageSize(4096)
                                             .serverCompressionLevel(7)
                                             .clientCompressionLevel(9)
                                             .serverNoContextTakeover(true)
                                             .clientNoContextTakeover(true)
                                             .serverMaxWindowBits(11)
                                             .clientMaxWindowBits(13));
  }

  static void assertDecodes(Value actualValue, WsEngineSettings expected) {
    final WsEngineSettings actual = WsEngineSettings.engineForm().cast(actualValue);
    assertEquals(actual, expected);
  }
}
