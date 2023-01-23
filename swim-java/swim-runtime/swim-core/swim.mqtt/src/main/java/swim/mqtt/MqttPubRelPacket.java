// Copyright 2015-2023 Swim.inc
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

public final class MqttPubRelPacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final int packetId;

  MqttPubRelPacket(int packetFlags, int packetId) {
    this.packetFlags = packetFlags;
    this.packetId = packetId;
  }

  @Override
  public int packetType() {
    return 6;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttPubRelPacket packetFlags(int packetFlags) {
    return new MqttPubRelPacket(packetFlags, this.packetId);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttPubRelPacket packetId(int packetId) {
    return new MqttPubRelPacket(this.packetFlags, packetId);
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    return 2;
  }

  @Override
  public Encoder<?, MqttPubRelPacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.pubRelPacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttPubRelPacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodePubRelPacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttPubRelPacket) {
      final MqttPubRelPacket that = (MqttPubRelPacket) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttPubRelPacket.hashSeed == 0) {
      MqttPubRelPacket.hashSeed = Murmur3.seed(MqttPubRelPacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(MqttPubRelPacket.hashSeed, this.packetFlags), this.packetId));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttPubRelPacket").write('.').write("create").write('(').debug(this.packetId).write(')');
    if (this.packetFlags != 2) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MqttPubRelPacket create(int packetFlags, int packetId) {
    return new MqttPubRelPacket(packetFlags, packetId);
  }

  public static MqttPubRelPacket create(int packetId) {
    return new MqttPubRelPacket(2, packetId);
  }

}
