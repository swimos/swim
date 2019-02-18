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

import swim.codec.Decoder;
import swim.codec.InputBuffer;

final class MqttPacketDecoder<T> extends Decoder<MqttPacket<T>> {
  final MqttDecoder mqtt;
  final Decoder<T> content;

  MqttPacketDecoder(MqttDecoder mqtt, Decoder<T> content) {
    this.mqtt = mqtt;
    this.content = content;
  }

  @Override
  public Decoder<MqttPacket<T>> feed(InputBuffer input) {
    return decode(input, this.mqtt, this.content);
  }

  static <T> Decoder<MqttPacket<T>> decode(InputBuffer input, MqttDecoder mqtt, Decoder<T> content) {
    if (input.isCont()) {
      final int packetType = (input.head() & 0xf0) >>> 4;
      return mqtt.decodePacketType(packetType, content, input);
    }
    return new MqttPacketDecoder<T>(mqtt, content);
  }
}
