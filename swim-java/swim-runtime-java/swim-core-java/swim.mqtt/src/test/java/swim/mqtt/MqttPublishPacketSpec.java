// Copyright 2015-2021 Swim Inc.
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
import swim.codec.Decoder;
import swim.codec.Utf8;
import swim.structure.Data;
import static swim.mqtt.MqttAssertions.assertEncodes;

public class MqttPublishPacketSpec {

  @Test
  public void decodePublishPacketsWithTopicName() {
    assertDecodesEmpty(Data.fromBase16("3006000474657374"),
                       MqttPublishPacket.create("test"));
  }

  @Test
  public void encodePublishPacketsWithTopicName() {
    assertEncodes(MqttPublishPacket.create("test"),
                  Data.fromBase16("3006000474657374"));
  }

  @Test
  public void decodePublishPacketsWithRetain() {
    assertDecodesEmpty(Data.fromBase16("3106000474657374"),
                       MqttPublishPacket.create("test").retain(true));
  }

  @Test
  public void encodePublishPacketsWithRetain() {
    assertEncodes(MqttPublishPacket.create("test").retain(true),
                  Data.fromBase16("3106000474657374"));
  }

  @Test
  public void decodePublishPacketsWithQoS() {
    assertDecodesEmpty(Data.fromBase16("3006000474657374"),
                       MqttPublishPacket.create("test").qos(MqttQoS.AT_MOST_ONCE));
    assertDecodesEmpty(Data.fromBase16("32080004746573740000"),
                       MqttPublishPacket.create("test").qos(MqttQoS.AT_LEAST_ONCE));
    assertDecodesEmpty(Data.fromBase16("34080004746573740000"),
                       MqttPublishPacket.create("test").qos(MqttQoS.EXACTLY_ONCE));
  }

  @Test
  public void encodePublishPacketsWithQoS() {
    assertEncodes(MqttPublishPacket.create("test").qos(MqttQoS.AT_MOST_ONCE),
                  Data.fromBase16("3006000474657374"));
    assertEncodes(MqttPublishPacket.create("test").qos(MqttQoS.AT_LEAST_ONCE),
                  Data.fromBase16("32080004746573740000"));
    assertEncodes(MqttPublishPacket.create("test").qos(MqttQoS.EXACTLY_ONCE),
                  Data.fromBase16("34080004746573740000"));
  }

  @Test
  public void decodePublishPacketsWithDup() {
    assertDecodesEmpty(Data.fromBase16("3806000474657374"),
                       MqttPublishPacket.create("test").dup(true));
  }

  @Test
  public void encodePublishPacketsWithDup() {
    assertEncodes(MqttPublishPacket.create("test").dup(true),
                  Data.fromBase16("3806000474657374"));
  }

  @Test
  public void decodePublishPacketsWithPacketId() {
    assertDecodesEmpty(Data.fromBase16("32080004746573747FAB"),
                       MqttPublishPacket.create("test").qos(MqttQoS.AT_LEAST_ONCE).packetId(0x7FAB));
  }

  @Test
  public void encodePublishPacketsWithPacketId() {
    assertEncodes(MqttPublishPacket.create("test").qos(MqttQoS.AT_LEAST_ONCE).packetId(0x7FAB),
                  Data.fromBase16("32080004746573747FAB"));
  }

  @Test
  public void decodePublishPacketsWithPayload() {
    assertDecodes(Data.fromBase16("300A00047465737464617461"),
                  MqttPublishPacket.create("test").payloadValue("data"));
  }

  @Test
  public void encodePublishPacketsWithPayload() {
    assertEncodes(MqttPublishPacket.create("test").payload("data"),
                  Data.fromBase16("300A00047465737464617461"));
  }

  @Test
  public void decodePublishPackets() {
    assertDecodes(Data.fromBase16("3D0C000474657374FEDC64617461"),
                  MqttPublishPacket.create("test")
                                   .retain(true)
                                   .qos(MqttQoS.EXACTLY_ONCE)
                                   .dup(true)
                                   .packetId(0xFEDC)
                                   .payloadValue("data"));
  }

  @Test
  public void encodePublishPackets() {
    assertEncodes(MqttPublishPacket.create("test")
                                   .retain(true)
                                   .qos(MqttQoS.EXACTLY_ONCE)
                                   .dup(true)
                                   .packetId(0xFEDC)
                                   .payload("data"),
                  Data.fromBase16("3D0C000474657374FEDC64617461"));
  }

  public static <T> void assertDecodes(Decoder<T> content, Data data, MqttPublishPacket<T> packet) {
    MqttAssertions.assertDecodesPacket(content, data, packet);
  }

  public static void assertDecodes(Data data, MqttPublishPacket<String> packet) {
    MqttAssertions.assertDecodesPacket(Utf8.stringParser(), data, packet);
  }

  public static void assertDecodesEmpty(Data data, MqttPublishPacket<Object> packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

}
