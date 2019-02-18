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

final class MqttSubscriptionDecoder extends Decoder<MqttSubscription> {
  final MqttDecoder mqtt;
  final Decoder<String> topicName;
  final int step;

  MqttSubscriptionDecoder(MqttDecoder mqtt, Decoder<String> topicName, int step) {
    this.mqtt = mqtt;
    this.topicName = topicName;
    this.step = step;
  }

  MqttSubscriptionDecoder(MqttDecoder mqtt) {
    this(mqtt, null, 1);
  }

  @Override
  public Decoder<MqttSubscription> feed(InputBuffer input) {
    return decode(input, this.mqtt, this.topicName, this.step);
  }

  static Decoder<MqttSubscription> decode(InputBuffer input, MqttDecoder mqtt,
                                          Decoder<String> topicName, int step) {
    if (step == 1) {
      if (topicName == null) {
        topicName = mqtt.decodeString(input);
      } else {
        topicName = topicName.feed(input);
      }
      if (topicName.isDone()) {
        step = 2;
      } else if (topicName.isError()) {
        return topicName.asError();
      }
    }
    if (step == 2 && input.isCont()) {
      final int flags = input.head();
      input = input.step();
      return done(mqtt.subscription(topicName.bind(), flags));
    }
    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new MqttSubscriptionDecoder(mqtt, topicName, step);
  }

  static Decoder<MqttSubscription> decode(InputBuffer input, MqttDecoder mqtt) {
    return decode(input, mqtt, null, 1);
  }
}
