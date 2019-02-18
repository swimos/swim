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
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class MqttSubscribe extends MqttPacket<Object> implements Debug {
  final int packetFlags;
  final int packetId;
  final FingerTrieSeq<MqttSubscription> subscriptions;

  MqttSubscribe(int packetFlags, int packetId, FingerTrieSeq<MqttSubscription> subscriptions) {
    this.packetFlags = packetFlags;
    this.packetId = packetId;
    this.subscriptions = subscriptions;
  }

  @Override
  public int packetType() {
    return 8;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttSubscribe packetFlags(int packetFlags) {
    return new MqttSubscribe(packetFlags, this.packetId, this.subscriptions);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttSubscribe packetId(int packetId) {
    return new MqttSubscribe(this.packetFlags, packetId, this.subscriptions);
  }

  public FingerTrieSeq<MqttSubscription> subscriptions() {
    return this.subscriptions;
  }

  public MqttSubscribe subscriptions(FingerTrieSeq<MqttSubscription> subscriptions) {
    return new MqttSubscribe(this.packetFlags, this.packetId, subscriptions);
  }

  public MqttSubscribe subscriptions(MqttSubscription... subscriptions) {
    return new MqttSubscribe(this.packetFlags, this.packetId, FingerTrieSeq.of(subscriptions));
  }

  public MqttSubscribe subscription(MqttSubscription subscription) {
    return new MqttSubscribe(this.packetFlags, this.packetId, this.subscriptions.appended(subscription));
  }

  public MqttSubscribe subscription(String topicName, MqttQoS qos) {
    return subscription(MqttSubscription.from(topicName, qos));
  }

  public MqttSubscribe subscription(String topicName) {
    return subscription(MqttSubscription.from(topicName));
  }

  @Override
  int bodySize(MqttEncoder mqtt) {
    int size = 2;
    for (int i = 0, n = this.subscriptions.size(); i < n; i += 1) {
      size += this.subscriptions.get(i).mqttSize(mqtt);
    }
    return size;
  }

  @Override
  public Encoder<?, MqttSubscribe> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.subscribeEncoder(this);
  }

  @Override
  public Encoder<?, MqttSubscribe> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeSubscribe(this, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttSubscribe) {
      final MqttSubscribe that = (MqttSubscribe) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId
          && this.subscriptions.equals(that.subscriptions);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttSubscribe.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.packetFlags), this.packetId), this.subscriptions.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttSubscribe").write('.').write("from").write('(')
        .debug(this.packetId).write(')');
    if (this.packetFlags != 2) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    for (int i = 0, n = subscriptions.size(); i < n; i += 1) {
      final MqttSubscription subscription = subscriptions.get(i);
      output = output.write('.').write("subscription").write('(').debug(subscription.topicName);
      if ((subscription.flags & MqttSubscription.QOS_MASK) != 0) {
        output = output.write(", ").debug(subscription.qos());
      }
      output = output.write(')');
    }
  }

  private static int hashSeed;

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MqttSubscribe from(int packetFlags, int packetId,
                                   FingerTrieSeq<MqttSubscription> subscriptions) {
    return new MqttSubscribe(packetFlags, packetId, subscriptions);
  }

  public static MqttSubscribe from(int packetId, FingerTrieSeq<MqttSubscription> subscriptions) {
    return new MqttSubscribe(2, packetId, subscriptions);
  }

  public static MqttSubscribe from(int packetId, MqttSubscription... subscriptions) {
    return new MqttSubscribe(2, packetId, FingerTrieSeq.of(subscriptions));
  }

  public static MqttSubscribe from(int packetId) {
    return new MqttSubscribe(2, packetId, FingerTrieSeq.<MqttSubscription>empty());
  }
}
