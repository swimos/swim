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

public class MqttSubscribeSpec {
  public static void assertDecodes(Data data, MqttSubscribe packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

  @Test
  public void decodeSubscribePacketsWithPacketId() {
    assertDecodes(Data.fromBase16("82027E96"), MqttSubscribe.from(0x7E96));
  }

  @Test
  public void encodeSubscribePacketsWithPacketId() {
    assertEncodes(MqttSubscribe.from(0x7E96), Data.fromBase16("82027E96"));
  }

  @Test
  public void decodeSubscribePacketsWithSingleSubscription() {
    assertDecodes(Data.fromBase16("8209000000047465737400"),
                  MqttSubscribe.from(0).subscription("test"));
  }

  @Test
  public void encodeSubscribePacketsWithSingleSubscription() {
    assertEncodes(MqttSubscribe.from(0).subscription("test"),
                  Data.fromBase16("8209000000047465737400"));
  }

  @Test
  public void decodeSubscribePacketsWithSingleSubscriptionWithQoS() {
    assertDecodes(Data.fromBase16("8209000000047465737400"),
                  MqttSubscribe.from(0).subscription("test", MqttQoS.AT_MOST_ONCE));
    assertDecodes(Data.fromBase16("8209000000047465737401"),
                  MqttSubscribe.from(0).subscription("test", MqttQoS.AT_LEAST_ONCE));
    assertDecodes(Data.fromBase16("8209000000047465737402"),
                  MqttSubscribe.from(0).subscription("test", MqttQoS.EXACTLY_ONCE));
  }

  @Test
  public void encodeSubscribePacketsWithSingleSubscriptionWithQoS() {
    assertEncodes(MqttSubscribe.from(0).subscription("test", MqttQoS.AT_MOST_ONCE),
                  Data.fromBase16("8209000000047465737400"));
    assertEncodes(MqttSubscribe.from(0).subscription("test", MqttQoS.AT_LEAST_ONCE),
                  Data.fromBase16("8209000000047465737401"));
    assertEncodes(MqttSubscribe.from(0).subscription("test", MqttQoS.EXACTLY_ONCE),
                  Data.fromBase16("8209000000047465737402"));
  }

  @Test
  public void decodeSubscribePacketsWithMultipleSubscriptions() {
    assertDecodes(Data.fromBase16("82150000000474657374000003666F6F00000362617200"),
                  MqttSubscribe.from(0).subscription("test").subscription("foo").subscription("bar"));
  }

  @Test
  public void encodeSubscribePacketsWithMultipleSubscriptions() {
    assertEncodes(MqttSubscribe.from(0).subscription("test").subscription("foo").subscription("bar"),
                  Data.fromBase16("82150000000474657374000003666F6F00000362617200"));
  }

  @Test
  public void decodeSubscribePacketsWithMultipleSubscriptionsWithQoS() {
    assertDecodes(Data.fromBase16("82150000000474657374000003666F6F01000362617202"),
                  MqttSubscribe.from(0)
                               .subscription("test", MqttQoS.AT_MOST_ONCE)
                               .subscription("foo", MqttQoS.AT_LEAST_ONCE)
                               .subscription("bar", MqttQoS.EXACTLY_ONCE));
  }

  @Test
  public void encodeSubscribePacketsWithMultipleSubscriptionsWithQoS() {
    assertEncodes(MqttSubscribe.from(0)
                               .subscription("test", MqttQoS.AT_MOST_ONCE)
                               .subscription("foo", MqttQoS.AT_LEAST_ONCE)
                               .subscription("bar", MqttQoS.EXACTLY_ONCE),
                  Data.fromBase16("82150000000474657374000003666F6F01000362617202"));
  }
}
