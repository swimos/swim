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

public final class MqttDisconnectPacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;

  MqttDisconnectPacket(int packetFlags) {
    this.packetFlags = packetFlags;
  }

  @Override
  public int packetType() {
    return 14;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttDisconnectPacket packetFlags(int packetFlags) {
    return new MqttDisconnectPacket(packetFlags);
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    return 0;
  }

  @Override
  public Encoder<?, MqttDisconnectPacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.disconnectPacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttDisconnectPacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeDisconnectPacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttDisconnectPacket) {
      final MqttDisconnectPacket that = (MqttDisconnectPacket) other;
      return this.packetFlags == that.packetFlags;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttDisconnectPacket.hashSeed == 0) {
      MqttDisconnectPacket.hashSeed = Murmur3.seed(MqttDisconnectPacket.class);
    }
    return Murmur3.mash(Murmur3.mix(MqttDisconnectPacket.hashSeed, this.packetFlags));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttDisconnectPacket").write('.').write("packet").write('(').write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static MqttDisconnectPacket packet;

  public static MqttDisconnectPacket packet() {
    if (MqttDisconnectPacket.packet == null) {
      MqttDisconnectPacket.packet = new MqttDisconnectPacket(0);
    }
    return MqttDisconnectPacket.packet;
  }

  public static MqttDisconnectPacket create(int packetFlags) {
    if (packetFlags == 0) {
      return MqttDisconnectPacket.packet();
    } else {
      return new MqttDisconnectPacket(packetFlags);
    }
  }

}
