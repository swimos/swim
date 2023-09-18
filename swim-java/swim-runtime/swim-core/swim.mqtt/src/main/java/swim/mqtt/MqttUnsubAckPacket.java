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
import swim.util.Murmur3;

public final class MqttUnsubAckPacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final int packetId;

  MqttUnsubAckPacket(int packetFlags, int packetId) {
    this.packetFlags = packetFlags;
    this.packetId = packetId;
  }

  @Override
  public int packetType() {
    return 11;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttUnsubAckPacket packetFlags(int packetFlags) {
    return new MqttUnsubAckPacket(packetFlags, this.packetId);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttUnsubAckPacket packetId(int packetId) {
    return new MqttUnsubAckPacket(this.packetFlags, packetId);
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    return 2;
  }

  @Override
  public Encoder<?, MqttUnsubAckPacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.unsubAckPacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttUnsubAckPacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeUnsubAckPacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttUnsubAckPacket) {
      final MqttUnsubAckPacket that = (MqttUnsubAckPacket) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttUnsubAckPacket.hashSeed == 0) {
      MqttUnsubAckPacket.hashSeed = Murmur3.seed(MqttUnsubAckPacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(MqttUnsubAckPacket.hashSeed, this.packetFlags), this.packetId));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttUnsubAckPacket").write('.').write("create").write('(').debug(this.packetId).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MqttUnsubAckPacket create(int packetFlags, int packetId) {
    return new MqttUnsubAckPacket(packetFlags, packetId);
  }

  public static MqttUnsubAckPacket create(int packetId) {
    return new MqttUnsubAckPacket(0, packetId);
  }

}
