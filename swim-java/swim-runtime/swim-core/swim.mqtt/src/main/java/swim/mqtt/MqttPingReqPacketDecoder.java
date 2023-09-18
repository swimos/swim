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

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class MqttPingReqPacketDecoder extends Decoder<MqttPingReqPacket> {

  final MqttDecoder mqtt;
  final int packetFlags;
  final int remaining;
  final int step;

  MqttPingReqPacketDecoder(MqttDecoder mqtt, int packetFlags, int remaining, int step) {
    this.mqtt = mqtt;
    this.packetFlags = packetFlags;
    this.remaining = remaining;
    this.step = step;
  }

  MqttPingReqPacketDecoder(MqttDecoder mqtt) {
    this(mqtt, 0, 0, 1);
  }

  @Override
  public Decoder<MqttPingReqPacket> feed(InputBuffer input) {
    return MqttPingReqPacketDecoder.decode(input, this.mqtt, this.packetFlags,
                                           this.remaining, this.step);
  }

  static Decoder<MqttPingReqPacket> decode(InputBuffer input, MqttDecoder mqtt,
                                           int packetFlags, int remaining, int step) {
    if (step == 1 && input.isCont()) {
      packetFlags = input.head() & 0x0f;
      input = input.step();
      step = 2;
    }
    while (step >= 2 && step <= 5 && input.isCont()) {
      final int b = input.head();
      input = input.step();
      remaining |= (b & 0x7f) << (7 * (step - 2));
      if ((b & 0x80) == 0) {
        step = 6;
        break;
      } else if (step < 5) {
        step += 1;
      } else {
        return Decoder.error(new MqttException("packet length too long"));
      }
    }
    if (step == 6 && remaining == 0) {
      return Decoder.done(mqtt.pingReqPacket(packetFlags));
    }
    if (remaining < 0) {
      return Decoder.error(new MqttException("packet length too short"));
    } else if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new MqttPingReqPacketDecoder(mqtt, packetFlags, remaining, step);
  }

  static Decoder<MqttPingReqPacket> decode(InputBuffer input, MqttDecoder mqtt) {
    return MqttPingReqPacketDecoder.decode(input, mqtt, 0, 0, 1);
  }

}
