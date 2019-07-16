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
import swim.collections.FingerTrieSeq;

final class MqttUnsubscribeDecoder extends Decoder<MqttUnsubscribe> {
  final MqttDecoder mqtt;
  final int packetFlags;
  final int packetId;
  final FingerTrieSeq<String> topicNames;
  final Decoder<String> topicName;
  final int remaining;
  final int step;

  MqttUnsubscribeDecoder(MqttDecoder mqtt, int packetFlags, int packetId,
                         FingerTrieSeq<String> topicNames, Decoder<String> topicName,
                         int remaining, int step) {
    this.mqtt = mqtt;
    this.packetFlags = packetFlags;
    this.packetId = packetId;
    this.topicNames = topicNames;
    this.topicName = topicName;
    this.remaining = remaining;
    this.step = step;
  }

  MqttUnsubscribeDecoder(MqttDecoder mqtt) {
    this(mqtt, 0, 0, FingerTrieSeq.<String>empty(), null, 0, 1);
  }

  @Override
  public Decoder<MqttUnsubscribe> feed(InputBuffer input) {
    return decode(input, this.mqtt, this.packetFlags, this.packetId,
                  this.topicNames, this.topicName, this.remaining, this.step);
  }

  static Decoder<MqttUnsubscribe> decode(InputBuffer input, MqttDecoder mqtt, int packetFlags,
                                         int packetId, FingerTrieSeq<String> topicNames,
                                         Decoder<String> topicName, int remaining, int step) {
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
    if (step == 6 && remaining > 0 && input.isCont()) {
      packetId = input.head() << 8;
      input = input.step();
      remaining -= 1;
      step = 7;
    }
    if (step == 7 && remaining > 0 && input.isCont()) {
      packetId |= input.head();
      input = input.step();
      remaining -= 1;
      if (remaining > 0) {
        step = 8;
      } else {
        step = 9;
      }
    }
    while (step == 8 && remaining > 0 && input.isCont()) {
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
      input = input.limit(inputLimit);
      remaining -= input.index() - inputStart;
      if (topicName.isDone()) {
        topicNames = topicNames.appended(topicName.bind());
        topicName = null;
        if (remaining == 0) {
          step = 9;
          break;
        }
      } else if (topicName.isError()) {
        return topicName.asError();
      }
    }
    if (step == 9 && remaining == 0) {
      return done(mqtt.unsubscribe(packetFlags, packetId, topicNames));
    }
    if (remaining < 0) {
      return error(new MqttException("packet length too short"));
    } else if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new MqttUnsubscribeDecoder(mqtt, packetFlags, packetId, topicNames,
                                      topicName, remaining, step);
  }

  static Decoder<MqttUnsubscribe> decode(InputBuffer input, MqttDecoder mqtt) {
    return decode(input, mqtt, 0, 0, FingerTrieSeq.<String>empty(), null, 0, 1);
  }
}
