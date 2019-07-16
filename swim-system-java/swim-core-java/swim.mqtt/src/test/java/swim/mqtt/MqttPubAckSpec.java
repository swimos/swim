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

package swim.mqtt;

import org.testng.annotations.Test;
import swim.structure.Data;
import static swim.mqtt.MqttAssertions.assertEncodes;

public class MqttPubAckSpec {
  public static void assertDecodes(Data data, MqttPubAck packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

  @Test
  public void decodePubAckPackets() {
    assertDecodes(Data.fromBase16("40020000"), MqttPubAck.from(0x0000));
    assertDecodes(Data.fromBase16("40027E96"), MqttPubAck.from(0x7E96));
  }

  @Test
  public void encodePubAckPackets() {
    assertEncodes(MqttPubAck.from(0x0000), Data.fromBase16("40020000"));
    assertEncodes(MqttPubAck.from(0x7E96), Data.fromBase16("40027E96"));
  }
}
