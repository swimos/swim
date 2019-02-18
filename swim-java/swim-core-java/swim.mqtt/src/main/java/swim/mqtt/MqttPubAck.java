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

public final class MqttPubAck extends MqttPacket<Object> implements Debug {
  final int packetFlags;
  final int packetId;

  MqttPubAck(int packetFlags, int packetId) {
    this.packetFlags = packetFlags;
    this.packetId = packetId;
  }

  @Override
  public int packetType() {
    return 4;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttPubAck packetFlags(int packetFlags) {
    return new MqttPubAck(packetFlags, this.packetId);
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttPubAck packetId(int packetId) {
    return new MqttPubAck(this.packetFlags, packetId);
  }

  @Override
  int bodySize(MqttEncoder mqtt) {
    return 2;
  }

  @Override
  public Encoder<?, MqttPubAck> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.pubAckEncoder(this);
  }

  @Override
  public Encoder<?, MqttPubAck> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodePubAck(this, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttPubAck) {
      final MqttPubAck that = (MqttPubAck) other;
      return this.packetFlags == that.packetFlags && this.packetId == that.packetId;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttPubAck.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed, this.packetFlags), this.packetId));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttPubAck").write('.').write("from").write('(')
        .debug(this.packetId).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static MqttPubAck from(int packetFlags, int packetId) {
    return new MqttPubAck(packetFlags, packetId);
  }

  public static MqttPubAck from(int packetId) {
    return new MqttPubAck(0, packetId);
  }
}
