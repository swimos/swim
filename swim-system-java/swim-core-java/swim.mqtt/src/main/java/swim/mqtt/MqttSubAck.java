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

public final class MqttSubAck extends MqttPacket<Object> implements Debug {
  final int packetFlags;
  final int packetId;
  final FingerTrieSeq<MqttSubStatus> subscriptions;

  MqttSubAck(int packetFlags, int packetId, FingerTrieSeq<MqttSubStatus> subscriptions) {
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

  public MqttSubAck packetFlags(int packetFlags) {
    return new MqttSubAck(packetFlags, this.packetId, this.subscriptions);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttSubAck packetId(int packetId) {
    return new MqttSubAck(this.packetFlags, packetId, this.subscriptions);
  }

  public FingerTrieSeq<MqttSubStatus> subscriptions() {
    return this.subscriptions;
  }

  public MqttSubAck subscriptions(FingerTrieSeq<MqttSubStatus> subscriptions) {
    return new MqttSubAck(this.packetFlags, this.packetId, subscriptions);
  }

  public MqttSubAck subscriptions(MqttSubStatus... subscriptions) {
    return new MqttSubAck(this.packetFlags, this.packetId, FingerTrieSeq.of(subscriptions));
  }

  public MqttSubAck subscription(MqttSubStatus subscription) {
    return new MqttSubAck(this.packetFlags, this.packetId, this.subscriptions.appended(subscription));
  }

  @Override
  int bodySize(MqttEncoder mqtt) {
    return 2 + this.subscriptions.size();
  }

  @Override
  public Encoder<?, MqttSubAck> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.subAckEncoder(this);
  }

  @Override
  public Encoder<?, MqttSubAck> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeSubAck(this, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttSubAck) {
      final MqttSubAck that = (MqttSubAck) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId
          && this.subscriptions.equals(that.subscriptions);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttSubAck.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.packetFlags), this.packetId), this.subscriptions.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttSubAck").write('.').write("from").write('(')
        .debug(this.packetId).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    for (int i = 0, n = subscriptions.size(); i < n; i += 1) {
      output = output.write('.').write("subscription").write('(').debug(this.subscriptions.get(i)).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static MqttSubAck from(int packetFlags, int packetId,
                                FingerTrieSeq<MqttSubStatus> subscriptions) {
    return new MqttSubAck(packetFlags, packetId, subscriptions);
  }

  public static MqttSubAck from(int packetId, FingerTrieSeq<MqttSubStatus> subscriptions) {
    return new MqttSubAck(0, packetId, subscriptions);
  }

  public static MqttSubAck from(int packetId, MqttSubStatus... subscriptions) {
    return new MqttSubAck(0, packetId, FingerTrieSeq.of(subscriptions));
  }

  public static MqttSubAck from(int packetId) {
    return new MqttSubAck(0, packetId, FingerTrieSeq.<MqttSubStatus>empty());
  }
}
