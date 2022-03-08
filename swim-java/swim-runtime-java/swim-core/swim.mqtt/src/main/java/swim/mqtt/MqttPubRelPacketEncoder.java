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

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

final class MqttPubRelPacketEncoder extends Encoder<Object, MqttPubRelPacket> {

  final MqttEncoder mqtt;
  final MqttPubRelPacket packet;
  final int length;
  final int remaining;
  final int step;

  MqttPubRelPacketEncoder(MqttEncoder mqtt, MqttPubRelPacket packet,
                          int length, int remaining, int step) {
    this.mqtt = mqtt;
    this.packet = packet;
    this.length = length;
    this.remaining = remaining;
    this.step = step;
  }

  MqttPubRelPacketEncoder(MqttEncoder mqtt, MqttPubRelPacket packet) {
    this(mqtt, packet, 0, 0, 1);
  }

  @Override
  public Encoder<Object, MqttPubRelPacket> pull(OutputBuffer<?> output) {
    return MqttPubRelPacketEncoder.encode(output, this.mqtt, this.packet,
                                          this.length, this.remaining, this.step);
  }

  static Encoder<Object, MqttPubRelPacket> encode(OutputBuffer<?> output, MqttEncoder mqtt,
                                                  MqttPubRelPacket packet, int length,
                                                  int remaining, int step) {
    if (step == 1 && output.isCont()) {
      length = packet.variableHeaderSize(mqtt);
      remaining = length;
      output = output.write(packet.packetType() << 4 | packet.packetFlags & 0x0f);
      step = 2;
    }
    while (step >= 2 && step <= 5 && output.isCont()) {
      int b = length & 0x7f;
      length = length >>> 7;
      if (length > 0) {
        b |= 0x80;
      }
      output = output.write(b);
      if (length == 0) {
        step = 6;
        break;
      } else if (step < 5) {
        step += 1;
      } else {
        return Encoder.error(new MqttException("packet length too long: " + remaining));
      }
    }
    if (step == 6 && remaining > 0 && output.isCont()) {
      output = output.write(packet.packetId >>> 8);
      remaining -= 1;
      step = 7;
    }
    if (step == 7 && remaining > 0 && output.isCont()) {
      output = output.write(packet.packetId);
      remaining -= 1;
      step = 8;
    }
    if (step == 8 && remaining == 0) {
      return Encoder.done(packet);
    }
    if (remaining < 0) {
      return Encoder.error(new MqttException("packet length too short"));
    } else if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new MqttPubRelPacketEncoder(mqtt, packet, length, remaining, step);
  }

  static Encoder<Object, MqttPubRelPacket> encode(OutputBuffer<?> output, MqttEncoder mqtt,
                                                  MqttPubRelPacket packet) {
    return MqttPubRelPacketEncoder.encode(output, mqtt, packet, 0, 0, 1);
  }

}
