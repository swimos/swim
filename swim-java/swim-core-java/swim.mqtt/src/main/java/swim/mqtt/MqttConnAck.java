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
import swim.util.Murmur3;

public final class MqttConnAck extends MqttPacket<Object> implements Debug {
  final int packetFlags;
  final int connectFlags;
  final int connectCode;

  MqttConnAck(int packetFlags, int connectFlags, int connectCode) {
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

  public MqttConnAck packetFlags(int packetFlags) {
    return new MqttConnAck(packetFlags, this.connectFlags, this.connectCode);
  }

  public int connectFlags() {
    return this.connectFlags;
  }

  public int connectCode() {
    return this.connectCode;
  }

  public boolean sessionPresent() {
    return (this.connectFlags & SESSION_PRESENT_FLAG) != 0;
  }

  public MqttConnAck sessionPresent(boolean sessionPresent) {
    final int connectFlags = sessionPresent
        ? this.connectFlags | SESSION_PRESENT_FLAG
        : this.connectFlags & ~SESSION_PRESENT_FLAG;
    return new MqttConnAck(this.packetFlags, connectFlags, this.connectCode);
  }

  public MqttConnStatus connectStatus() {
    return MqttConnStatus.from(connectCode);
  }

  public MqttConnAck connectStatus(MqttConnStatus connectStatus) {
    return new MqttConnAck(this.packetFlags, this.connectFlags, connectStatus.code);
  }

  @Override
  int bodySize(MqttEncoder mqtt) {
    return 2;
  }

  @Override
  public Encoder<?, MqttConnAck> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.connAckEncoder(this);
  }

  @Override
  public Encoder<?, MqttConnAck> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeConnAck(this, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttConnAck) {
      final MqttConnAck that = (MqttConnAck) other;
      return this.packetFlags == that.packetFlags && this.connectFlags == that.connectFlags
          && this.connectCode == that.connectCode;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttConnAck.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.packetFlags), this.connectFlags), this.connectCode));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttConnAck").write('.');
    if (this.packetFlags == 0 && this.connectFlags == 0 && this.connectCode == 0) {
      output = output.write('.').write("accepted").write('(').write(')');
    } else {
      output = output.write("from").write('(').debug(connectStatus()).write(')');
      if (this.packetFlags != 0) {
        output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
      }
      if (sessionPresent()) {
        output = output.write('.').write("sessionPresent").write('(').write("true").write(')');
      }
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int SESSION_PRESENT_FLAG = 0x01;

  private static int hashSeed;

  private static MqttConnAck accepted;

  public static MqttConnAck accepted() {
    if (accepted == null) {
      accepted = new MqttConnAck(0, 0, 0);
    }
    return accepted;
  }

  public static MqttConnAck from(int packetFlags, int connectFlags, int connectCode) {
    if (packetFlags == 0 && connectFlags == 0 && connectCode == 0) {
      return accepted();
    } else {
      return new MqttConnAck(packetFlags, connectFlags, connectCode);
    }
  }

  public static MqttConnAck from(MqttConnStatus connectStatus) {
    if (connectStatus.code == 0) {
      return accepted();
    } else {
      return new MqttConnAck(0, 0, connectStatus.code);
    }
  }
}
