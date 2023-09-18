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

public class MqttConnectPacketSpec {

  @Test
  public void decodeConnectPacketsWithClientIds() {
    assertDecodes(Data.fromBase16("101000044D51545404020000000474657374"),
                  MqttConnectPacket.create("test"));
  }

  @Test
  public void encodeConnectPacketsWithClientIds() {
    assertEncodes(MqttConnectPacket.create("test"),
                  Data.fromBase16("101000044D51545404020000000474657374"));
  }

  @Test
  public void decodeConnectPacketsWithCleanSession() {
    assertDecodes(Data.fromBase16("100C00044D515454040000000000"),
                  MqttConnectPacket.create("").cleanSession(false));
    assertDecodes(Data.fromBase16("100C00044D515454040200000000"),
                  MqttConnectPacket.create("").cleanSession(true));
  }

  @Test
  public void encodeConnectPacketsWithCleanSession() {
    assertEncodes(MqttConnectPacket.create("").cleanSession(false),
                  Data.fromBase16("100C00044D515454040000000000"));
    assertEncodes(MqttConnectPacket.create("").cleanSession(true),
                  Data.fromBase16("100C00044D515454040200000000"));
  }

  @Test
  public void decodeConnectPacketsWithKeepAlive() {
    assertDecodes(Data.fromBase16("100C00044D51545404020E100000"),
                  MqttConnectPacket.create("").keepAlive(3600));
  }

  @Test
  public void encodeConnectPacketsWithKeepAlive() {
    assertEncodes(MqttConnectPacket.create("").keepAlive(3600),
                  Data.fromBase16("100C00044D51545404020E100000"));
  }

  @Test
  public void decodeConnectPacketsWithWillTopicAndMessage() {
    assertDecodes(Data.fromBase16("101600044D515454040600000000000468656C7000027F81"),
                  MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81")));
  }

  @Test
  public void encodeConnectPacketsWithWillTopicAndMessage() {
    assertEncodes(MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81")),
                  Data.fromBase16("101600044D515454040600000000000468656C7000027F81"));
  }

  @Test
  public void decodeConnectPacketsWithWillQoS() {
    assertDecodes(Data.fromBase16("101600044D515454040E00000000000468656C7000027F81"),
                  MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81"))
                                   .willQoS(MqttQoS.AT_LEAST_ONCE));
    assertDecodes(Data.fromBase16("101600044D515454040600000000000468656C7000027F81"),
                  MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81"))
                                   .willQoS(MqttQoS.AT_MOST_ONCE));
    assertDecodes(Data.fromBase16("101600044D515454041600000000000468656C7000027F81"),
                  MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81"))
                                   .willQoS(MqttQoS.EXACTLY_ONCE));
  }

  @Test
  public void encodeConnectPacketsWithWillQoS() {
    assertEncodes(MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81"))
                                   .willQoS(MqttQoS.AT_LEAST_ONCE),
                  Data.fromBase16("101600044D515454040E00000000000468656C7000027F81"));
    assertEncodes(MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81"))
                                    .willQoS(MqttQoS.AT_MOST_ONCE),
                  Data.fromBase16("101600044D515454040600000000000468656C7000027F81"));
    assertEncodes(MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81"))
                                   .willQoS(MqttQoS.EXACTLY_ONCE),
                  Data.fromBase16("101600044D515454041600000000000468656C7000027F81"));
  }

  @Test
  public void decodeConnectPacketsWithWillRetain() {
    assertDecodes(Data.fromBase16("101600044D515454042600000000000468656C7000027F81"),
                  MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81"))
                                   .willRetain(true));
  }

  @Test
  public void encodeConnectPacketsWithWillRetain() {
    assertEncodes(MqttConnectPacket.create("").willTopic("help").willMessage(Data.fromBase16("7F81"))
                                   .willRetain(true),
                  Data.fromBase16("101600044D515454042600000000000468656C7000027F81"));
  }

  @Test
  public void decodeConnectPacketsWithUsername() {
    assertDecodes(Data.fromBase16("101100044D5154540482000000000003626F62"),
                  MqttConnectPacket.create("").username("bob"));
  }

  @Test
  public void encodeConnectPacketsWithUsername() {
    assertEncodes(MqttConnectPacket.create("").username("bob"),
                  Data.fromBase16("101100044D5154540482000000000003626F62"));
  }

  @Test
  public void decodeConnectPacketsWithPassword() {
    assertDecodes(Data.fromBase16("101600044D51545404420000000000080123456789ABCDEF"),
                  MqttConnectPacket.create("").password(Data.fromBase16("0123456789ABCDEF")));
  }

  @Test
  public void encodeConnectPacketsWithPassword() {
    assertEncodes(MqttConnectPacket.create("").password(Data.fromBase16("0123456789ABCDEF")),
                  Data.fromBase16("101600044D51545404420000000000080123456789ABCDEF"));
  }

  @Test
  public void decodeConnectPackets() {
    assertDecodes(Data.fromBase16("102400044D51545404F60E10000474657374000468656C7000027F810003626F620003ABCDEF"),
                  MqttConnectPacket.create("test")
                                   .keepAlive(3600)
                                   .willTopic("help")
                                   .willMessage(Data.fromBase16("7F81"))
                                   .willQoS(MqttQoS.EXACTLY_ONCE)
                                   .willRetain(true)
                                   .username("bob")
                                   .password(Data.fromBase16("ABCDEF")));
  }

  @Test
  public void encodeConnectPackets() {
    assertEncodes(MqttConnectPacket.create("test")
                                   .keepAlive(3600)
                                   .willTopic("help")
                                   .willMessage(Data.fromBase16("7F81"))
                                   .willQoS(MqttQoS.EXACTLY_ONCE)
                                   .willRetain(true)
                                   .username("bob")
                                   .password(Data.fromBase16("ABCDEF")),
                  Data.fromBase16("102400044D51545404F60E10000474657374000468656C7000027F810003626F620003ABCDEF"));
  }

  public static void assertDecodes(Data data, MqttConnectPacket packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

}
