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

public final class MqttSubAckPacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final int packetId;
  final FingerTrieSeq<MqttSubStatus> subscriptions;

  MqttSubAckPacket(int packetFlags, int packetId, FingerTrieSeq<MqttSubStatus> subscriptions) {
    this.packetFlags = packetFlags;
    this.packetId = packetId;
    this.subscriptions = subscriptions;
  }

  @Override
  public int packetType() {
    return 9;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttSubAckPacket packetFlags(int packetFlags) {
    return new MqttSubAckPacket(packetFlags, this.packetId, this.subscriptions);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttSubAckPacket packetId(int packetId) {
    return new MqttSubAckPacket(this.packetFlags, packetId, this.subscriptions);
  }

  public FingerTrieSeq<MqttSubStatus> subscriptions() {
    return this.subscriptions;
  }

  public MqttSubAckPacket subscriptions(FingerTrieSeq<MqttSubStatus> subscriptions) {
    return new MqttSubAckPacket(this.packetFlags, this.packetId, subscriptions);
  }

  public MqttSubAckPacket subscriptions(MqttSubStatus... subscriptions) {
    return new MqttSubAckPacket(this.packetFlags, this.packetId, FingerTrieSeq.of(subscriptions));
  }

  public MqttSubAckPacket subscription(MqttSubStatus subscription) {
    return new MqttSubAckPacket(this.packetFlags, this.packetId, this.subscriptions.appended(subscription));
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    return 2 + this.subscriptions.size();
  }

  @Override
  public Encoder<?, MqttSubAckPacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.subAckPacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttSubAckPacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeSubAckPacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttSubAckPacket) {
      final MqttSubAckPacket that = (MqttSubAckPacket) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId
          && this.subscriptions.equals(that.subscriptions);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttSubAckPacket.hashSeed == 0) {
      MqttSubAckPacket.hashSeed = Murmur3.seed(MqttSubAckPacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(MqttSubAckPacket.hashSeed,
        this.packetFlags), this.packetId), this.subscriptions.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttSubAckPacket").write('.').write("create").write('(').debug(this.packetId).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    for (int i = 0, n = this.subscriptions.size(); i < n; i += 1) {
      output = output.write('.').write("subscription").write('(').debug(this.subscriptions.get(i)).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MqttSubAckPacket create(int packetFlags, int packetId,
                                        FingerTrieSeq<MqttSubStatus> subscriptions) {
    return new MqttSubAckPacket(packetFlags, packetId, subscriptions);
  }

  public static MqttSubAckPacket create(int packetId, FingerTrieSeq<MqttSubStatus> subscriptions) {
    return new MqttSubAckPacket(0, packetId, subscriptions);
  }

  public static MqttSubAckPacket create(int packetId, MqttSubStatus... subscriptions) {
    return new MqttSubAckPacket(0, packetId, FingerTrieSeq.of(subscriptions));
  }

  public static MqttSubAckPacket create(int packetId) {
    return new MqttSubAckPacket(0, packetId, FingerTrieSeq.<MqttSubStatus>empty());
  }

}
