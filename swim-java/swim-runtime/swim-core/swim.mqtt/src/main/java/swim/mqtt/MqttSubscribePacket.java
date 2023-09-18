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

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class MqttSubscribePacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final int packetId;
  final FingerTrieSeq<MqttSubscription> subscriptions;

  MqttSubscribePacket(int packetFlags, int packetId, FingerTrieSeq<MqttSubscription> subscriptions) {
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

  public MqttSubscribePacket packetFlags(int packetFlags) {
    return new MqttSubscribePacket(packetFlags, this.packetId, this.subscriptions);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttSubscribePacket packetId(int packetId) {
    return new MqttSubscribePacket(this.packetFlags, packetId, this.subscriptions);
  }

  public FingerTrieSeq<MqttSubscription> subscriptions() {
    return this.subscriptions;
  }

  public MqttSubscribePacket subscriptions(FingerTrieSeq<MqttSubscription> subscriptions) {
    return new MqttSubscribePacket(this.packetFlags, this.packetId, subscriptions);
  }

  public MqttSubscribePacket subscriptions(MqttSubscription... subscriptions) {
    return new MqttSubscribePacket(this.packetFlags, this.packetId, FingerTrieSeq.of(subscriptions));
  }

  public MqttSubscribePacket subscription(MqttSubscription subscription) {
    return new MqttSubscribePacket(this.packetFlags, this.packetId, this.subscriptions.appended(subscription));
  }

  public MqttSubscribePacket subscription(String topicName, MqttQoS qos) {
    return this.subscription(MqttSubscription.create(topicName, qos));
  }

  public MqttSubscribePacket subscription(String topicName) {
    return this.subscription(MqttSubscription.create(topicName));
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    int size = 2;
    for (int i = 0, n = this.subscriptions.size(); i < n; i += 1) {
      size += this.subscriptions.get(i).mqttSize(mqtt);
    }
    return size;
  }

  @Override
  public Encoder<?, MqttSubscribePacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.subscribePacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttSubscribePacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeSubscribePacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttSubscribePacket) {
      final MqttSubscribePacket that = (MqttSubscribePacket) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId
          && this.subscriptions.equals(that.subscriptions);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttSubscribePacket.hashSeed == 0) {
      MqttSubscribePacket.hashSeed = Murmur3.seed(MqttSubscribePacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(MqttSubscribePacket.hashSeed,
        this.packetFlags), this.packetId), this.subscriptions.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttSubscribePacket").write('.').write("create").write('(')
                   .debug(this.packetId).write(')');
    if (this.packetFlags != 2) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    for (int i = 0, n = this.subscriptions.size(); i < n; i += 1) {
      final MqttSubscription subscription = this.subscriptions.get(i);
      output = output.write('.').write("subscription").write('(').debug(subscription.topicName);
      if ((subscription.flags & MqttSubscription.QOS_MASK) != 0) {
        output = output.write(", ").debug(subscription.qos());
      }
      output = output.write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MqttSubscribePacket create(int packetFlags, int packetId,
                                           FingerTrieSeq<MqttSubscription> subscriptions) {
    return new MqttSubscribePacket(packetFlags, packetId, subscriptions);
  }

  public static MqttSubscribePacket create(int packetId, FingerTrieSeq<MqttSubscription> subscriptions) {
    return new MqttSubscribePacket(2, packetId, subscriptions);
  }

  public static MqttSubscribePacket create(int packetId, MqttSubscription... subscriptions) {
    return new MqttSubscribePacket(2, packetId, FingerTrieSeq.of(subscriptions));
  }

  public static MqttSubscribePacket create(int packetId) {
    return new MqttSubscribePacket(2, packetId, FingerTrieSeq.<MqttSubscription>empty());
  }

}
