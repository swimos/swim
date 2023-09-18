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

final class MqttPublishPacketDecoder<T> extends Decoder<MqttPublishPacket<T>> {

  final MqttDecoder mqtt;
  final Decoder<T> payloadDecoder;
  final int packetFlags;
  final Decoder<String> topicNameDecoder;
  final int packetId;
  final int remaining;
  final int step;

  MqttPublishPacketDecoder(MqttDecoder mqtt, Decoder<T> payloadDecoder,
                           int packetFlags, Decoder<String> topicNameDecoder,
                           int packetId, int remaining, int step) {
    this.mqtt = mqtt;
    this.payloadDecoder = payloadDecoder;
    this.packetFlags = packetFlags;
    this.topicNameDecoder = topicNameDecoder;
    this.packetId = packetId;
    this.remaining = remaining;
    this.step = step;
  }

  MqttPublishPacketDecoder(MqttDecoder mqtt, Decoder<T> payloadDecoder) {
    this(mqtt, payloadDecoder, 0, null, 0, 0, 1);
  }

  @Override
  public Decoder<MqttPublishPacket<T>> feed(InputBuffer input) {
    return MqttPublishPacketDecoder.decode(input, this.mqtt, this.payloadDecoder,
                                           this.packetFlags, this.topicNameDecoder,
                                           this.packetId, this.remaining, this.step);
  }

  static <T> Decoder<MqttPublishPacket<T>> decode(InputBuffer input, MqttDecoder mqtt,
                                                  Decoder<T> payloadDecoder, int packetFlags,
                                                  Decoder<String> topicNameDecoder,
                                                  int packetId, int remaining, int step) {
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
    if (step == 6) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (topicNameDecoder == null) {
        topicNameDecoder = mqtt.decodeString(input);
      } else {
        topicNameDecoder = topicNameDecoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (topicNameDecoder.isDone()) {
        if (((packetFlags & MqttPublishPacket.QOS_MASK) >>> MqttPublishPacket.QOS_SHIFT) != 0) {
          step = 7;
        } else {
          step = 9;
        }
      } else if (topicNameDecoder.isError()) {
        return topicNameDecoder.asError();
      }
    }
    if (step == 7 && remaining > 0 && input.isCont()) {
      packetId = input.head() << 8;
      input = input.step();
      remaining -= 1;
      step = 8;
    }
    if (step == 8 && remaining > 0 && input.isCont()) {
      packetId |= input.head();
      input = input.step();
      remaining -= 1;
      step = 9;
    }
    if (step == 9) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      payloadDecoder = payloadDecoder.feed(input);
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (payloadDecoder.isDone()) {
        step = 10;
      } else if (payloadDecoder.isError()) {
        return payloadDecoder.asError();
      }
    }
    if (step == 10 && remaining == 0) {
      return Decoder.done(mqtt.publishPacket(packetFlags, topicNameDecoder.bind(),
                                             packetId, payloadDecoder.bind()));
    }
    if (remaining < 0) {
      return Decoder.error(new MqttException("packet length too short"));
    } else if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new MqttPublishPacketDecoder<T>(mqtt, payloadDecoder, packetFlags,
                                           topicNameDecoder, packetId, remaining, step);
  }

  static <T> Decoder<MqttPublishPacket<T>> decode(InputBuffer input, MqttDecoder mqtt,
                                                  Decoder<T> payloadDecoder) {
    return MqttPublishPacketDecoder.decode(input, mqtt, payloadDecoder, 0, null, 0, 0, 1);
  }

}
