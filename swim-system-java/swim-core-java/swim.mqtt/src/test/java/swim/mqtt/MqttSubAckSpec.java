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

public class MqttSubAckSpec {
  public static void assertDecodes(Data data, MqttSubAck packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

  @Test
  public void decodeSubAckPacketsWithPacketId() {
    assertDecodes(Data.fromBase16("90027E96"), MqttSubAck.from(0x7E96));
  }

  @Test
  public void encodeSubAckPacketsWithPacketId() {
    assertEncodes(MqttSubAck.from(0x7E96), Data.fromBase16("90027E96"));
  }

  @Test
  public void decodeSubAckPacketsWithSingleSubscription() {
    assertDecodes(Data.fromBase16("9003000000"),
                  MqttSubAck.from(0).subscription(MqttSubStatus.AT_MOST_ONCE));
    assertDecodes(Data.fromBase16("9003000001"),
                  MqttSubAck.from(0).subscription(MqttSubStatus.AT_LEAST_ONCE));
    assertDecodes(Data.fromBase16("9003000002"),
                  MqttSubAck.from(0).subscription(MqttSubStatus.EXACTLY_ONCE));
    assertDecodes(Data.fromBase16("9003000080"),
                  MqttSubAck.from(0).subscription(MqttSubStatus.FAILURE));
  }

  @Test
  public void encodeSubAckPacketsWithSingleSubscription() {
    assertEncodes(MqttSubAck.from(0).subscription(MqttSubStatus.AT_MOST_ONCE),
                  Data.fromBase16("9003000000"));
    assertEncodes(MqttSubAck.from(0).subscription(MqttSubStatus.AT_LEAST_ONCE),
                  Data.fromBase16("9003000001"));
    assertEncodes(MqttSubAck.from(0).subscription(MqttSubStatus.EXACTLY_ONCE),
                  Data.fromBase16("9003000002"));
    assertEncodes(MqttSubAck.from(0).subscription(MqttSubStatus.FAILURE),
                  Data.fromBase16("9003000080"));
  }

  @Test
  public void decodeSubAckPacketsWithMultipleSubscriptions() {
    assertDecodes(Data.fromBase16("9006000000010280"),
                  MqttSubAck.from(0)
                            .subscription(MqttSubStatus.AT_MOST_ONCE)
                            .subscription(MqttSubStatus.AT_LEAST_ONCE)
                            .subscription(MqttSubStatus.EXACTLY_ONCE)
                            .subscription(MqttSubStatus.FAILURE));
  }

  @Test
  public void encodeSubAckPacketsWithMultipleSubscriptions() {
    assertEncodes(MqttSubAck.from(0)
                            .subscription(MqttSubStatus.AT_MOST_ONCE)
                            .subscription(MqttSubStatus.AT_LEAST_ONCE)
                            .subscription(MqttSubStatus.EXACTLY_ONCE)
                            .subscription(MqttSubStatus.FAILURE),
                  Data.fromBase16("9006000000010280"));
  }
}
