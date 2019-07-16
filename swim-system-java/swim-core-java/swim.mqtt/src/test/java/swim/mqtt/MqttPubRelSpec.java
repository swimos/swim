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

public class MqttPubRelSpec {
  public static void assertDecodes(Data data, MqttPubRel packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

  @Test
  public void decodePubRelPackets() {
    assertDecodes(Data.fromBase16("62020000"), MqttPubRel.from(0x0000));
    assertDecodes(Data.fromBase16("62027E96"), MqttPubRel.from(0x7E96));
  }

  @Test
  public void encodePubRelPackets() {
    assertEncodes(MqttPubRel.from(0x0000), Data.fromBase16("62020000"));
    assertEncodes(MqttPubRel.from(0x7E96), Data.fromBase16("62027E96"));
  }
}
