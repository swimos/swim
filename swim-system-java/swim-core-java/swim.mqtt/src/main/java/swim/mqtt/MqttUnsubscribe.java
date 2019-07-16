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

public final class MqttUnsubscribe extends MqttPacket<Object> implements Debug {
  final int packetFlags;
  final int packetId;
  final FingerTrieSeq<String> topicNames;

  MqttUnsubscribe(int packetFlags, int packetId, FingerTrieSeq<String> topicNames) {
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

  public MqttUnsubscribe packetFlags(int packetFlags) {
    return new MqttUnsubscribe(packetFlags, this.packetId, this.topicNames);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttUnsubscribe packetId(int packetId) {
    return new MqttUnsubscribe(this.packetFlags, packetId, this.topicNames);
  }

  public FingerTrieSeq<String> topicNames() {
    return this.topicNames;
  }

  public MqttUnsubscribe topicNames(FingerTrieSeq<String> topicNames) {
    return new MqttUnsubscribe(this.packetFlags, this.packetId, topicNames);
  }

  public MqttUnsubscribe topicNames(String... topicNames) {
    return new MqttUnsubscribe(this.packetFlags, this.packetId, FingerTrieSeq.of(topicNames));
  }

  public MqttUnsubscribe topicName(String topicName) {
    return new MqttUnsubscribe(this.packetFlags, this.packetId, this.topicNames.appended(topicName));
  }

  @Override
  int bodySize(MqttEncoder mqtt) {
    int size = 2;
    for (int i = 0, n = this.topicNames.size(); i < n; i += 1) {
      size += mqtt.sizeOfString(this.topicNames.get(i));
    }
    return size;
  }

  @Override
  public Encoder<?, MqttUnsubscribe> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.unsubscribeEncoder(this);
  }

  @Override
  public Encoder<?, MqttUnsubscribe> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeUnsubscribe(this, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttUnsubscribe) {
      final MqttUnsubscribe that = (MqttUnsubscribe) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId
          && this.topicNames.equals(that.topicNames);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttUnsubscribe.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.packetFlags), this.packetId), this.topicNames.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttUnsubscribe").write('.').write("from").write('(')
        .debug(this.packetId).write(')');
    if (this.packetFlags != 2) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    for (int i = 0, n = this.topicNames.size(); i < n; i += 1) {
      output = output.write('.').write("topicName").write('(').debug(this.topicNames.get(i)).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static MqttUnsubscribe from(int packetFlags, int packetId, FingerTrieSeq<String> topicNames) {
    return new MqttUnsubscribe(packetFlags, packetId, topicNames);
  }

  public static MqttUnsubscribe from(int packetId, FingerTrieSeq<String> topicNames) {
    return new MqttUnsubscribe(2, packetId, topicNames);
  }

  public static MqttUnsubscribe from(int packetId, String... topicNames) {
    return new MqttUnsubscribe(2, packetId, FingerTrieSeq.of(topicNames));
  }

  public static MqttUnsubscribe from(int packetId) {
    return new MqttUnsubscribe(2, packetId, FingerTrieSeq.<String>empty());
  }
}
