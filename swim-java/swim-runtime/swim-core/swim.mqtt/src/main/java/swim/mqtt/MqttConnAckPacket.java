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

public final class MqttConnAckPacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final int connectFlags;
  final int connectCode;

  MqttConnAckPacket(int packetFlags, int connectFlags, int connectCode) {
    this.packetFlags = packetFlags;
    this.connectFlags = connectFlags;
    this.connectCode = connectCode;
  }

  @Override
  public int packetType() {
    return 2;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttConnAckPacket packetFlags(int packetFlags) {
    return new MqttConnAckPacket(packetFlags, this.connectFlags, this.connectCode);
  }

  public int connectFlags() {
    return this.connectFlags;
  }

  public int connectCode() {
    return this.connectCode;
  }

  public boolean sessionPresent() {
    return (this.connectFlags & MqttConnAckPacket.SESSION_PRESENT_FLAG) != 0;
  }

  public MqttConnAckPacket sessionPresent(boolean sessionPresent) {
    final int connectFlags = sessionPresent
                           ? this.connectFlags | MqttConnAckPacket.SESSION_PRESENT_FLAG
                           : this.connectFlags & ~MqttConnAckPacket.SESSION_PRESENT_FLAG;
    return new MqttConnAckPacket(this.packetFlags, connectFlags, this.connectCode);
  }

  public MqttConnStatus connectStatus() {
    return MqttConnStatus.create(this.connectCode);
  }

  public MqttConnAckPacket connectStatus(MqttConnStatus connectStatus) {
    return new MqttConnAckPacket(this.packetFlags, this.connectFlags, connectStatus.code);
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    return 2;
  }

  @Override
  public Encoder<?, MqttConnAckPacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.connAckPacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttConnAckPacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeConnAckPacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttConnAckPacket) {
      final MqttConnAckPacket that = (MqttConnAckPacket) other;
      return this.packetFlags == that.packetFlags && this.connectFlags == that.connectFlags
          && this.connectCode == that.connectCode;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttConnAckPacket.hashSeed == 0) {
      MqttConnAckPacket.hashSeed = Murmur3.seed(MqttConnAckPacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(MqttConnAckPacket.hashSeed,
        this.packetFlags), this.connectFlags), this.connectCode));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttConnAckPacket").write('.');
    if (this.packetFlags == 0 && this.connectFlags == 0 && this.connectCode == 0) {
      output = output.write('.').write("accepted").write('(').write(')');
    } else {
      output = output.write("create").write('(').debug(this.connectStatus()).write(')');
      if (this.packetFlags != 0) {
        output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
      }
      if (this.sessionPresent()) {
        output = output.write('.').write("sessionPresent").write('(').write("true").write(')');
      }
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int SESSION_PRESENT_FLAG = 0x01;

  private static MqttConnAckPacket accepted;

  public static MqttConnAckPacket accepted() {
    if (MqttConnAckPacket.accepted == null) {
      MqttConnAckPacket.accepted = new MqttConnAckPacket(0, 0, 0);
    }
    return MqttConnAckPacket.accepted;
  }

  public static MqttConnAckPacket create(int packetFlags, int connectFlags, int connectCode) {
    if (packetFlags == 0 && connectFlags == 0 && connectCode == 0) {
      return MqttConnAckPacket.accepted();
    } else {
      return new MqttConnAckPacket(packetFlags, connectFlags, connectCode);
    }
  }

  public static MqttConnAckPacket create(MqttConnStatus connectStatus) {
    if (connectStatus.code == 0) {
      return MqttConnAckPacket.accepted();
    } else {
      return new MqttConnAckPacket(0, 0, connectStatus.code);
    }
  }

}
