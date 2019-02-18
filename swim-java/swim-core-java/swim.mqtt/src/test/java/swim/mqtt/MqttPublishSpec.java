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
import swim.codec.Decoder;
import swim.codec.Utf8;
import swim.structure.Data;
import static swim.mqtt.MqttAssertions.assertEncodes;

public class MqttPublishSpec {
  public static <T> void assertDecodes(Decoder<T> content, Data data, MqttPublish<T> packet) {
    MqttAssertions.assertDecodesPacket(content, data, packet);
  }

  public static void assertDecodes(Data data, MqttPublish<String> packet) {
    MqttAssertions.assertDecodesPacket(Utf8.stringParser(), data, packet);
  }

  public static void assertDecodesEmpty(Data data, MqttPublish<Object> packet) {
    MqttAssertions.assertDecodesPacket(data, packet);
  }

  @Test
  public void decodePublishPacketsWithTopicName() {
    assertDecodesEmpty(Data.fromBase16("3006000474657374"),
                       MqttPublish.from("test").payload(MqttValue.empty()));
  }

  @Test
  public void encodePublishPacketsWithTopicName() {
    assertEncodes(MqttPublish.from("test"),
                  Data.fromBase16("3006000474657374"));
  }

  @Test
  public void decodePublishPacketsWithRetain() {
    assertDecodesEmpty(Data.fromBase16("3106000474657374"),
                       MqttPublish.from("test").retain(true).payload(MqttValue.empty()));
  }

  @Test
  public void encodePublishPacketsWithRetain() {
    assertEncodes(MqttPublish.from("test").retain(true),
                  Data.fromBase16("3106000474657374"));
  }

  @Test
  public void decodePublishPacketsWithQoS() {
    assertDecodesEmpty(Data.fromBase16("3006000474657374"),
                       MqttPublish.from("test").qos(MqttQoS.AT_MOST_ONCE).payload(MqttValue.empty()));
    assertDecodesEmpty(Data.fromBase16("32080004746573740000"),
                       MqttPublish.from("test").qos(MqttQoS.AT_LEAST_ONCE).payload(MqttValue.empty()));
    assertDecodesEmpty(Data.fromBase16("34080004746573740000"),
                       MqttPublish.from("test").qos(MqttQoS.EXACTLY_ONCE).payload(MqttValue.empty()));
  }

  @Test
  public void encodePublishPacketsWithQoS() {
    assertEncodes(MqttPublish.from("test").qos(MqttQoS.AT_MOST_ONCE),
                  Data.fromBase16("3006000474657374"));
    assertEncodes(MqttPublish.from("test").qos(MqttQoS.AT_LEAST_ONCE),
                  Data.fromBase16("32080004746573740000"));
    assertEncodes(MqttPublish.from("test").qos(MqttQoS.EXACTLY_ONCE),
                  Data.fromBase16("34080004746573740000"));
  }

  @Test
  public void decodePublishPacketsWithDup() {
    assertDecodesEmpty(Data.fromBase16("3806000474657374"),
                       MqttPublish.from("test").dup(true).payload(MqttValue.empty()));
  }

  @Test
  public void encodePublishPacketsWithDup() {
    assertEncodes(MqttPublish.from("test").dup(true),
                  Data.fromBase16("3806000474657374"));
  }

  @Test
  public void decodePublishPacketsWithPacketId() {
    assertDecodesEmpty(Data.fromBase16("32080004746573747FAB"),
                       MqttPublish.from("test").qos(MqttQoS.AT_LEAST_ONCE).packetId(0x7FAB)
                                  .payload(MqttValue.empty()));
  }

  @Test
  public void encodePublishPacketsWithPacketId() {
    assertEncodes(MqttPublish.from("test").qos(MqttQoS.AT_LEAST_ONCE).packetId(0x7FAB),
                  Data.fromBase16("32080004746573747FAB"));
  }

  @Test
  public void decodePublishPacketsWithPayload() {
    assertDecodes(Data.fromBase16("300A00047465737464617461"),
                  MqttPublish.from("test").payload(MqttValue.from("data")));
  }

  @Test
  public void encodePublishPacketsWithPayload() {
    assertEncodes(MqttPublish.from("test").payload("data"),
                  Data.fromBase16("300A00047465737464617461"));
  }

  @Test
  public void decodePublishPackets() {
    assertDecodes(Data.fromBase16("3D0C000474657374FEDC64617461"),
                  MqttPublish.from("test")
                             .retain(true)
                             .qos(MqttQoS.EXACTLY_ONCE)
                             .dup(true)
                             .packetId(0xFEDC)
                             .payload(MqttValue.from("data")));
  }

  @Test
  public void encodePublishPackets() {
    assertEncodes(MqttPublish.from("test")
                             .retain(true)
                             .qos(MqttQoS.EXACTLY_ONCE)
                             .dup(true)
                             .packetId(0xFEDC)
                             .payload("data"),
                  Data.fromBase16("3D0C000474657374FEDC64617461"));
  }
}
