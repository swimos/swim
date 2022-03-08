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

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.collections.FingerTrieSeq;

final class MqttSubscribePacketDecoder extends Decoder<MqttSubscribePacket> {

  final MqttDecoder mqtt;
  final int packetFlags;
  final int packetId;
  final Decoder<MqttSubscription> subscriptionDecoder;
  final FingerTrieSeq<MqttSubscription> subscriptions;
  final int remaining;
  final int step;

  MqttSubscribePacketDecoder(MqttDecoder mqtt, int packetFlags, int packetId,
                             Decoder<MqttSubscription> subscriptionDecoder,
                             FingerTrieSeq<MqttSubscription> subscriptions,
                             int remaining, int step) {
    this.mqtt = mqtt;
    this.packetFlags = packetFlags;
    this.remaining = remaining;
    this.packetId = packetId;
    this.subscriptionDecoder = subscriptionDecoder;
    this.subscriptions = subscriptions;
    this.step = step;
  }

  MqttSubscribePacketDecoder(MqttDecoder mqtt) {
    this(mqtt, 0, 0, null, FingerTrieSeq.<MqttSubscription>empty(), 0, 1);
  }

  @Override
  public Decoder<MqttSubscribePacket> feed(InputBuffer input) {
    return MqttSubscribePacketDecoder.decode(input, this.mqtt, this.packetFlags,
                                             this.packetId, this.subscriptionDecoder,
                                             this.subscriptions, this.remaining, this.step);
  }

  static Decoder<MqttSubscribePacket> decode(InputBuffer input, MqttDecoder mqtt,
                                             int packetFlags, int packetId,
                                             Decoder<MqttSubscription> subscriptionDecoder,
                                             FingerTrieSeq<MqttSubscription> subscriptions,
                                             int remaining, int step) {
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
      if (subscriptionDecoder == null) {
        subscriptionDecoder = mqtt.decodeSubscription(input);
      } else {
        subscriptionDecoder = subscriptionDecoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (subscriptionDecoder.isDone()) {
        subscriptions = subscriptions.appended(subscriptionDecoder.bind());
        subscriptionDecoder = null;
        if (remaining == 0) {
          step = 9;
          break;
        }
      } else if (subscriptionDecoder.isError()) {
        return subscriptionDecoder.asError();
      }
    }
    if (step == 9 && remaining == 0) {
      return Decoder.done(mqtt.subscribePacket(packetFlags, packetId, subscriptions));
    }
    if (remaining < 0) {
      return Decoder.error(new MqttException("packet length too short"));
    } else if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new MqttSubscribePacketDecoder(mqtt, packetFlags, packetId, subscriptionDecoder,
                                          subscriptions, remaining, step);
  }

  static Decoder<MqttSubscribePacket> decode(InputBuffer input, MqttDecoder mqtt) {
    return MqttSubscribePacketDecoder.decode(input, mqtt, 0, 0, null,
                                             FingerTrieSeq.<MqttSubscription>empty(), 0, 1);
  }

}
