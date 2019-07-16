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

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

final class MqttSubscriptionEncoder extends Encoder<MqttSubscription, MqttSubscription> {
  final MqttEncoder mqtt;
  final MqttSubscription subscription;
  final Encoder<?, ?> part;
  final int step;

  MqttSubscriptionEncoder(MqttEncoder mqtt, MqttSubscription subscription,
                          Encoder<?, ?> part, int step) {
    this.mqtt = mqtt;
    this.subscription = subscription;
    this.part = part;
    this.step = step;
  }

  MqttSubscriptionEncoder(MqttEncoder mqtt, MqttSubscription subscription) {
    this(mqtt, subscription, null, 1);
  }

  @Override
  public Encoder<MqttSubscription, MqttSubscription> feed(MqttSubscription subscription) {
    return new MqttSubscriptionEncoder(this.mqtt, subscription, null, 1);
  }

  @Override
  public Encoder<MqttSubscription, MqttSubscription> pull(OutputBuffer<?> output) {
    return encode(output, this.mqtt, this.subscription, this.part, this.step);
  }

  static int sizeOf(MqttEncoder mqtt, MqttSubscription subscription) {
    return mqtt.sizeOfString(subscription.topicName) + 1;
  }

  static Encoder<MqttSubscription, MqttSubscription> encode(OutputBuffer<?> output, MqttEncoder mqtt,
                                                            MqttSubscription subscription,
                                                            Encoder<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = mqtt.encodeString(subscription.topicName, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 2;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output = output.write(subscription.flags);
      return done(subscription);
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new MqttSubscriptionEncoder(mqtt, subscription, part, step);
  }

  static Encoder<MqttSubscription, MqttSubscription> encode(OutputBuffer<?> output, MqttEncoder mqtt,
                                                            MqttSubscription subscription) {
    return encode(output, mqtt, subscription, null, 1);
  }
}
