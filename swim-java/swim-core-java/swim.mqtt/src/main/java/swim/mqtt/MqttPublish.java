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

import java.nio.ByteBuffer;
import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.util.Murmur3;

public final class MqttPublish<T> extends MqttPacket<T> implements Debug {
  final int packetFlags;
  final String topicName;
  final int packetId;
  final MqttEntity<T> payload;

  MqttPublish(int packetFlags, String topicName, int packetId, MqttEntity<T> payload) {
    this.packetFlags = packetFlags;
    this.topicName = topicName;
    this.packetId = packetId;
    this.payload = payload;
  }

  @Override
  public int packetType() {
    return 3;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public boolean retain() {
    return (this.packetFlags & RETAIN_FLAG) != 0;
  }

  public MqttPublish<T> retain(boolean retain) {
    final int packetFlags = retain ? this.packetFlags | RETAIN_FLAG : this.packetFlags & ~RETAIN_FLAG;
    return new MqttPublish<T>(packetFlags, this.topicName, this.packetId, this.payload);
  }

  public MqttQoS qos() {
    return MqttQoS.from((this.packetFlags & QOS_MASK) >>> QOS_SHIFT);
  }

  public MqttPublish<T> qos(MqttQoS qos) {
    final int packetFlags = this.packetFlags & ~QOS_MASK | (qos.code << QOS_SHIFT) & QOS_MASK;
    return new MqttPublish<T>(packetFlags, this.topicName, this.packetId, this.payload);
  }

  public boolean dup() {
    return (this.packetFlags & DUP_FLAG) != 0;
  }

  public MqttPublish<T> dup(boolean dup) {
    final int packetFlags = dup ? this.packetFlags | DUP_FLAG : this.packetFlags & ~DUP_FLAG;
    return new MqttPublish<T>(packetFlags, this.topicName, this.packetId, this.payload);
  }

  public String topicName() {
    return this.topicName;
  }

  public MqttPublish<T> topicName(String topicName) {
    return new MqttPublish<T>(this.packetFlags, topicName, this.packetId, this.payload);
  }

  public boolean hasPacketId() {
    return ((this.packetFlags & QOS_MASK) >>> QOS_SHIFT) != 0;
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttPublish<T> packetId(int packetId) {
    return new MqttPublish<T>(this.packetFlags, this.topicName, packetId, this.payload);
  }

  public MqttEntity<T> payload() {
    return this.payload;
  }

  public <U> MqttPublish<U> payload(MqttEntity<U> payload) {
    return new MqttPublish<U>(this.packetFlags, this.topicName, this.packetId, payload);
  }

  public <U> MqttPublish<U> payload(Encoder<?, ?> content, int length) {
    return new MqttPublish<U>(packetFlags, topicName, packetId, MqttPayload.<U>from(content, length));
  }

  public <U> MqttPublish<U> payload(ByteBuffer data) {
    return new MqttPublish<U>(packetFlags, topicName, packetId, MqttPayload.<U>from(data));
  }

  public MqttPublish<String> payload(String content) {
    return new MqttPublish<String>(packetFlags, topicName, packetId, MqttPayload.from(content));
  }

  @Override
  int bodySize(MqttEncoder mqtt) {
    int size = mqtt.sizeOfString(this.topicName);
    if (hasPacketId()) {
      size += 2;
    }
    size += payload.mqttSize();
    return size;
  }

  @Override
  public Encoder<?, MqttPublish<T>> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.publishEncoder(this);
  }

  @Override
  public Encoder<?, MqttPublish<T>> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodePublish(this, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttPublish) {
      final MqttPublish<?> that = (MqttPublish<?>) other;
      return this.packetFlags == that.packetFlags && this.topicName.equals(that.topicName)
          && this.packetId == that.packetId && this.payload.equals(that.payload);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttPublish.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.packetFlags), this.topicName.hashCode()), this.packetId), this.payload.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttPublish").write('.').write("from").write('(')
        .debug(this.topicName).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    if (retain()) {
      output = output.write('.').write("retain").write('(').write("true").write(')');
    }
    if (qos().code != 0) {
      output = output.write('.').write("qos").write('(').debug(qos()).write(')');
    }
    if (dup()) {
      output = output.write('.').write("dup").write('(').write("true").write(')');
    }
    if (hasPacketId()) {
      output = output.write('.').write("packetId").write('(').debug(this.packetId).write(')');
    }
    if (payload.isDefined()) {
      output = output.write('.').write("payload").write('(').debug(this.payload).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int RETAIN_FLAG = 0x01;
  static final int QOS_MASK = 0x06;
  static final int QOS_SHIFT = 1;
  static final int DUP_FLAG = 0x08;

  private static int hashSeed;

  public static <T> MqttPublish<T> from(int packetFlags, String topicName,
                                        int packetId, MqttEntity<T> payload) {
    return new MqttPublish<T>(packetFlags, topicName, packetId, payload);
  }

  public static <T> MqttPublish<T> from(String topicName, int packetId, MqttEntity<T> payload) {
    return new MqttPublish<T>(0, topicName, packetId, payload);
  }

  public static <T> MqttPublish<T> from(String topicName, MqttEntity<T> payload) {
    return new MqttPublish<T>(0, topicName, 0, payload);
  }

  public static MqttPublish<Object> from(String topicName) {
    return new MqttPublish<Object>(0, topicName, 0, MqttEntity.empty());
  }
}
