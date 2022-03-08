// Copyright 2015-2022 Swim.inc
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

public class MqttConnAckPacketSpec {

  @Test
  public void decodeConnAckPacketsWithConnectStatus() {
    assertDecodes(Data.fromBase16("20020000"),
                  MqttConnAckPacket.create(MqttConnStatus.ACCEPTED));
    assertDecodes(Data.fromBase16("20020001"),
                  MqttConnAckPacket.create(MqttConnStatus.UNACCEPTABLE_PROTOCOL_VERSION));
    assertDecodes(Data.fromBase16("20020002"),
                  MqttConnAckPacket.create(MqttConnStatus.IDENTIFIER_REJECTED));
    assertDecodes(Data.fromBase16("20020003"),
                  MqttConnAckPacket.create(MqttConnStatus.SERVER_UNAVAILABLE));
    assertDecodes(Data.fromBase16("20020004"),
                  MqttConnAckPacket.create(MqttConnStatus.BAD_USERNAME_OR_PASSWORD));
    assertDecodes(Data.fromBase16("20020005"),
                  MqttConnAckPacket.create(MqttConnStatus.NOT_AUTHORIZED));
  }

  @Test
  public void encodeConnAckPacketsWithConnectStatus() {
    assertEncodes(MqttConnAckPacket.create(MqttConnStatus.ACCEPTED),
                  Data.fromBase16("20020000"));
    assertEncodes(MqttConnAckPacket.create(MqttConnStatus.UNACCEPTABLE_PROTOCOL_VERSION),
                  Data.fromBase16("20020001"));
    assertEncodes(MqttConnAckPacket.create(MqttConnStatus.IDENTIFIER_REJECTED),
                  Data.fromBase16("20020002"));
    assertEncodes(MqttConnAckPacket.create(MqttConnStatus.SERVER_UNAVAILABLE),
                  Data.fromBase16("20020003"));
    assertEncodes(MqttConnAckPacket.create(MqttConnStatus.BAD_USERNAME_OR_PASSWORD),
                  Data.fromBase16("20020004"));
    assertEncodes(MqttConnAckPacket.create(MqttConnStatus.NOT_AUTHORIZED),
                  Data.fromBase16("20020005"));
  }

  @Test
  public void decodeConnAckPacketsWithSessionPresent() {
    assertDecodes(Data.fromBase16("20020000"),
                  MqttConnAckPacket.accepted().sessionPresent(false));
    assertDecodes(Data.fromBase16("20020100"),
                  MqttConnAckPacket.accepted().sessionPresent(true));
  }

  @Test
  public void encodeConnAckPacketsWithSessionPresent() {
    assertEncodes(MqttConnAckPacket.accepted().sessionPresent(false),
                  Data.fromBase16("20020000"));
    assertEncodes(MqttConnAckPacket.accepted().sessionPresent(true),
                  Data.fromBase16("20020100"));
  }

  public static void assertDecodes(Data data, MqttConnAckPacket packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

}
