// Copyright 2015-2023 Nstream, inc.
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

public class MqttSubscribePacketSpec {

  @Test
  public void decodeSubscribePacketsWithPacketId() {
    assertDecodes(Data.fromBase16("82027E96"), MqttSubscribePacket.create(0x7E96));
  }

  @Test
  public void encodeSubscribePacketsWithPacketId() {
    assertEncodes(MqttSubscribePacket.create(0x7E96), Data.fromBase16("82027E96"));
  }

  @Test
  public void decodeSubscribePacketsWithSingleSubscription() {
    assertDecodes(Data.fromBase16("8209000000047465737400"),
                  MqttSubscribePacket.create(0).subscription("test"));
  }

  @Test
  public void encodeSubscribePacketsWithSingleSubscription() {
    assertEncodes(MqttSubscribePacket.create(0).subscription("test"),
                  Data.fromBase16("8209000000047465737400"));
  }

  @Test
  public void decodeSubscribePacketsWithSingleSubscriptionWithQoS() {
    assertDecodes(Data.fromBase16("8209000000047465737400"),
                  MqttSubscribePacket.create(0).subscription("test", MqttQoS.AT_MOST_ONCE));
    assertDecodes(Data.fromBase16("8209000000047465737401"),
                  MqttSubscribePacket.create(0).subscription("test", MqttQoS.AT_LEAST_ONCE));
    assertDecodes(Data.fromBase16("8209000000047465737402"),
                  MqttSubscribePacket.create(0).subscription("test", MqttQoS.EXACTLY_ONCE));
  }

  @Test
  public void encodeSubscribePacketsWithSingleSubscriptionWithQoS() {
    assertEncodes(MqttSubscribePacket.create(0).subscription("test", MqttQoS.AT_MOST_ONCE),
                  Data.fromBase16("8209000000047465737400"));
    assertEncodes(MqttSubscribePacket.create(0).subscription("test", MqttQoS.AT_LEAST_ONCE),
                  Data.fromBase16("8209000000047465737401"));
    assertEncodes(MqttSubscribePacket.create(0).subscription("test", MqttQoS.EXACTLY_ONCE),
                  Data.fromBase16("8209000000047465737402"));
  }

  @Test
  public void decodeSubscribePacketsWithMultipleSubscriptions() {
    assertDecodes(Data.fromBase16("82150000000474657374000003666F6F00000362617200"),
                  MqttSubscribePacket.create(0).subscription("test").subscription("foo").subscription("bar"));
  }

  @Test
  public void encodeSubscribePacketsWithMultipleSubscriptions() {
    assertEncodes(MqttSubscribePacket.create(0).subscription("test").subscription("foo").subscription("bar"),
                  Data.fromBase16("82150000000474657374000003666F6F00000362617200"));
  }

  @Test
  public void decodeSubscribePacketsWithMultipleSubscriptionsWithQoS() {
    assertDecodes(Data.fromBase16("82150000000474657374000003666F6F01000362617202"),
                  MqttSubscribePacket.create(0)
                                     .subscription("test", MqttQoS.AT_MOST_ONCE)
                                     .subscription("foo", MqttQoS.AT_LEAST_ONCE)
                                     .subscription("bar", MqttQoS.EXACTLY_ONCE));
  }

  @Test
  public void encodeSubscribePacketsWithMultipleSubscriptionsWithQoS() {
    assertEncodes(MqttSubscribePacket.create(0)
                                     .subscription("test", MqttQoS.AT_MOST_ONCE)
                                     .subscription("foo", MqttQoS.AT_LEAST_ONCE)
                                     .subscription("bar", MqttQoS.EXACTLY_ONCE),
                  Data.fromBase16("82150000000474657374000003666F6F01000362617202"));
  }

  public static void assertDecodes(Data data, MqttSubscribePacket packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

}
