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
import swim.codec.InputBuffer;

final class MqttPacketDecoder<T> extends Decoder<MqttPacket<T>> {

  final MqttDecoder mqtt;
  final Decoder<T> payloadDecoder;

  MqttPacketDecoder(MqttDecoder mqtt, Decoder<T> payloadDecoder) {
    this.mqtt = mqtt;
    this.payloadDecoder = payloadDecoder;
  }

  @Override
  public Decoder<MqttPacket<T>> feed(InputBuffer input) {
    return MqttPacketDecoder.decode(input, this.mqtt, this.payloadDecoder);
  }

  static <T> Decoder<MqttPacket<T>> decode(InputBuffer input, MqttDecoder mqtt,
                                           Decoder<T> payloadDecoder) {
    if (input.isCont()) {
      final int packetType = (input.head() & 0xf0) >>> 4;
      return mqtt.decodePacketType(input, packetType, payloadDecoder);
    }
    return new MqttPacketDecoder<T>(mqtt, payloadDecoder);
  }

}
