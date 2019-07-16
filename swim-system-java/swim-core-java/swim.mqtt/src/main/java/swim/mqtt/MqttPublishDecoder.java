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
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class MqttPublishDecoder<T> extends Decoder<MqttPublish<T>> {
  final MqttDecoder mqtt;
  final Decoder<T> payload;
  final int packetFlags;
  final Decoder<String> topicName;
  final int packetId;
  final int remaining;
  final int step;

  MqttPublishDecoder(MqttDecoder mqtt, Decoder<T> payload, int packetFlags,
                     Decoder<String> topicName, int packetId, int remaining, int step) {
    this.mqtt = mqtt;
    this.payload = payload;
    this.packetFlags = packetFlags;
    this.topicName = topicName;
    this.packetId = packetId;
    this.remaining = remaining;
    this.step = step;
  }

  MqttPublishDecoder(MqttDecoder mqtt, Decoder<T> payload) {
    this(mqtt, payload, 0, null, 0, 0, 1);
  }

  @Override
  public Decoder<MqttPublish<T>> feed(InputBuffer input) {
    return decode(input, this.mqtt, this.payload, this.packetFlags,
                  this.topicName, this.packetId, this.remaining, this.step);
  }

  static <T> Decoder<MqttPublish<T>> decode(InputBuffer input, MqttDecoder mqtt, Decoder<T> payload,
                                            int packetFlags, Decoder<String> topicName,
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
        return error(new MqttException("packet length too long"));
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
      if (topicName == null) {
        topicName = mqtt.decodeString(input);
      } else {
        topicName = topicName.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (topicName.isDone()) {
        if (((packetFlags & MqttPublish.QOS_MASK) >>> MqttPublish.QOS_SHIFT) != 0) {
          step = 7;
        } else {
          step = 9;
        }
      } else if (topicName.isError()) {
        return topicName.asError();
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
      payload = payload.feed(input);
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (payload.isDone()) {
        step = 10;
      } else if (payload.isError()) {
        return payload.asError();
      }
    }
    if (step == 10 && remaining == 0) {
      return done(mqtt.publish(packetFlags, topicName.bind(), packetId,
                               MqttValue.from(payload.bind())));
    }
    if (remaining < 0) {
      return error(new MqttException("packet length too short"));
    } else if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new MqttPublishDecoder<T>(mqtt, payload, packetFlags, topicName, packetId, remaining, step);
  }

  static <T> Decoder<MqttPublish<T>> decode(InputBuffer input, MqttDecoder mqtt,
                                            Decoder<T> payload) {
    return decode(input, mqtt, payload, 0, null, 0, 0, 1);
  }
}
