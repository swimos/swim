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

package swim.io;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class TcpSettingsSpec {
  void assertDecodes(Value actualValue, TcpSettings expected) {
    final TcpSettings actual = TcpSettings.form().cast(actualValue);
    assertEquals(actual, expected);
  }

  void assertEncodes(TcpSettings settings, Value expectedValue) {
    final Value actualValue = (Value) TcpSettings.form().mold(settings);
    assertEquals(actualValue, expectedValue);
  }

  @Test
  public void decodesStandardTcpSettings() {
    assertDecodes(Record.of(Attr.of("tcp")), TcpSettings.standard());
  }

  @Test
  public void decodesTcpSettings() {
    assertDecodes(Record.of(Attr.of("tcp"),
                            Slot.of("keepAlive", true),
                            Slot.of("noDelay", true),
                            Slot.of("receiveBufferSize", 2),
                            Slot.of("sendBufferSize", 3),
                            Slot.of("readBufferSize", 5),
                            Slot.of("writeBufferSize", 7)),
                  new TcpSettings(true, true, 2, 3, 5, 7));
  }

  @Test
  public void encodesStandardTcpSettings() {
    assertEncodes(TcpSettings.standard(), Record.of(Attr.of("tcp")));
  }

  @Test
  public void encodesTcpSettings() {
    assertEncodes(new TcpSettings(true, true, 2, 3, 5, 7),
                  Record.of(Attr.of("tcp"),
                            Slot.of("keepAlive", true),
                            Slot.of("noDelay", true),
                            Slot.of("receiveBufferSize", 2),
                            Slot.of("sendBufferSize", 3),
                            Slot.of("readBufferSize", 5),
                            Slot.of("writeBufferSize", 7)));
  }
}
