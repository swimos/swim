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

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.util.Murmur3;

public final class MqttSubscription extends MqttPart implements Debug {
  final String topicName;
  final int flags;

  MqttSubscription(String topicName, int flags) {
    this.topicName = topicName;
    this.flags = flags;
  }

  public String topicName() {
    return this.topicName;
  }

  public MqttSubscription topicName(String topicName) {
    return new MqttSubscription(topicName, this.flags);
  }

  public int flags() {
    return this.flags;
  }

  public MqttQoS qos() {
    return MqttQoS.from(this.flags & QOS_MASK);
  }

  public MqttSubscription qos(MqttQoS qos) {
    final int flags = this.flags & ~QOS_MASK | qos.code;
    return new MqttSubscription(this.topicName, flags);
  }

  public int mqttSize(MqttEncoder mqtt) {
    return mqtt.sizeOfSubscription(this);
  }

  @Override
  public Encoder<?, MqttSubscription> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.subscriptionEncoder(this);
  }

  @Override
  public Encoder<?, MqttSubscription> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeSubscription(this, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttSubscription) {
      final MqttSubscription that = (MqttSubscription) other;
      return this.topicName.equals(that.topicName) && this.flags == that.flags;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttSubscription.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed, this.topicName.hashCode()), this.flags));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttSubscription").write('.').write("from").write('(').debug(this.topicName);
    if ((this.flags & QOS_MASK) != 0) {
      output = output.write(", ").debug(qos());
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int QOS_MASK = 0x03;

  private static int hashSeed;

  public static MqttSubscription from(String topicName, int flags) {
    return new MqttSubscription(topicName, flags);
  }

  public static MqttSubscription from(String topicName, MqttQoS qos) {
    return new MqttSubscription(topicName, qos.code);
  }

  public static MqttSubscription from(String topicName) {
    return new MqttSubscription(topicName, 0);
  }
}
