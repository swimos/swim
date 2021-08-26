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

public final class MqttUnsubAck extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final int packetId;

  MqttUnsubAck(int packetFlags, int packetId) {
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

  public MqttUnsubAck packetFlags(int packetFlags) {
    return new MqttUnsubAck(packetFlags, this.packetId);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttUnsubAck packetId(int packetId) {
    return new MqttUnsubAck(this.packetFlags, packetId);
  }

  @Override
  int bodySize(MqttEncoder mqtt) {
    return 2;
  }

  @Override
  public Encoder<?, MqttUnsubAck> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.unsubAckEncoder(this);
  }

  @Override
  public Encoder<?, MqttUnsubAck> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeUnsubAck(this, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttUnsubAck) {
      final MqttUnsubAck that = (MqttUnsubAck) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttUnsubAck.hashSeed == 0) {
      MqttUnsubAck.hashSeed = Murmur3.seed(MqttUnsubAck.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(MqttUnsubAck.hashSeed, this.packetFlags), this.packetId));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttUnsubAck").write('.').write("create").write('(').debug(this.packetId).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MqttUnsubAck create(int packetFlags, int packetId) {
    return new MqttUnsubAck(packetFlags, packetId);
  }

  public static MqttUnsubAck create(int packetId) {
    return new MqttUnsubAck(0, packetId);
  }

}
