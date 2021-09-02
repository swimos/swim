// Copyright 2015-2021 Swim Inc.
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

public final class MqttPubCompPacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final int packetId;

  MqttPubCompPacket(int packetFlags, int packetId) {
    this.packetFlags = packetFlags;
    this.packetId = packetId;
  }

  @Override
  public int packetType() {
    return 7;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttPubCompPacket packetFlags(int packetFlags) {
    return new MqttPubCompPacket(packetFlags, this.packetId);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttPubCompPacket packetId(int packetId) {
    return new MqttPubCompPacket(this.packetFlags, packetId);
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    return 2;
  }

  @Override
  public Encoder<?, MqttPubCompPacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.pubCompPacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttPubCompPacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodePubCompPacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttPubCompPacket) {
      final MqttPubCompPacket that = (MqttPubCompPacket) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttPubCompPacket.hashSeed == 0) {
      MqttPubCompPacket.hashSeed = Murmur3.seed(MqttPubCompPacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(MqttPubCompPacket.hashSeed, this.packetFlags), this.packetId));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttPubCompPacket").write('.').write("create").write('(').debug(this.packetId).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MqttPubCompPacket create(int packetFlags, int packetId) {
    return new MqttPubCompPacket(packetFlags, packetId);
  }

  public static MqttPubCompPacket create(int packetId) {
    return new MqttPubCompPacket(0, packetId);
  }

}
