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

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class MqttUnsubscribePacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final int packetId;
  final FingerTrieSeq<String> topicNames;

  MqttUnsubscribePacket(int packetFlags, int packetId, FingerTrieSeq<String> topicNames) {
    this.packetFlags = packetFlags;
    this.packetId = packetId;
    this.topicNames = topicNames;
  }

  @Override
  public int packetType() {
    return 10;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttUnsubscribePacket packetFlags(int packetFlags) {
    return new MqttUnsubscribePacket(packetFlags, this.packetId, this.topicNames);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttUnsubscribePacket packetId(int packetId) {
    return new MqttUnsubscribePacket(this.packetFlags, packetId, this.topicNames);
  }

  public FingerTrieSeq<String> topicNames() {
    return this.topicNames;
  }

  public MqttUnsubscribePacket topicNames(FingerTrieSeq<String> topicNames) {
    return new MqttUnsubscribePacket(this.packetFlags, this.packetId, topicNames);
  }

  public MqttUnsubscribePacket topicNames(String... topicNames) {
    return new MqttUnsubscribePacket(this.packetFlags, this.packetId, FingerTrieSeq.of(topicNames));
  }

  public MqttUnsubscribePacket topicName(String topicName) {
    return new MqttUnsubscribePacket(this.packetFlags, this.packetId, this.topicNames.appended(topicName));
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    int size = 2;
    for (int i = 0, n = this.topicNames.size(); i < n; i += 1) {
      size += mqtt.sizeOfString(this.topicNames.get(i));
    }
    return size;
  }

  @Override
  public Encoder<?, MqttUnsubscribePacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.unsubscribePacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttUnsubscribePacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeUnsubscribePacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttUnsubscribePacket) {
      final MqttUnsubscribePacket that = (MqttUnsubscribePacket) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId
          && this.topicNames.equals(that.topicNames);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttUnsubscribePacket.hashSeed == 0) {
      MqttUnsubscribePacket.hashSeed = Murmur3.seed(MqttUnsubscribePacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(MqttUnsubscribePacket.hashSeed,
        this.packetFlags), this.packetId), this.topicNames.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttUnsubscribePacket").write('.').write("create").write('(')
                   .debug(this.packetId).write(')');
    if (this.packetFlags != 2) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    for (int i = 0, n = this.topicNames.size(); i < n; i += 1) {
      output = output.write('.').write("topicName").write('(').debug(this.topicNames.get(i)).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MqttUnsubscribePacket create(int packetFlags, int packetId, FingerTrieSeq<String> topicNames) {
    return new MqttUnsubscribePacket(packetFlags, packetId, topicNames);
  }

  public static MqttUnsubscribePacket create(int packetId, FingerTrieSeq<String> topicNames) {
    return new MqttUnsubscribePacket(2, packetId, topicNames);
  }

  public static MqttUnsubscribePacket create(int packetId, String... topicNames) {
    return new MqttUnsubscribePacket(2, packetId, FingerTrieSeq.of(topicNames));
  }

  public static MqttUnsubscribePacket create(int packetId) {
    return new MqttUnsubscribePacket(2, packetId, FingerTrieSeq.<String>empty());
  }

}
