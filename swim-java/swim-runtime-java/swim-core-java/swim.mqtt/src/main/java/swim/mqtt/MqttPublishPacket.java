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

import java.nio.ByteBuffer;
import swim.codec.Binary;
import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.structure.Data;
import swim.util.Murmur3;

public final class MqttPublishPacket<T> extends MqttPacket<T> implements Debug {

  final int packetFlags;
  final String topicName;
  final int packetId;
  final T payloadValue;
  final Encoder<?, ?> payloadEncoder;
  final int payloadSize;

  MqttPublishPacket(int packetFlags, String topicName, int packetId, T payloadValue,
                    Encoder<?, ?> payloadEncoder, int payloadSize) {
    this.packetFlags = packetFlags;
    this.topicName = topicName;
    this.packetId = packetId;
    this.payloadValue = payloadValue;
    this.payloadEncoder = payloadEncoder;
    this.payloadSize = payloadSize;
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
    return (this.packetFlags & MqttPublishPacket.RETAIN_FLAG) != 0;
  }

  public MqttPublishPacket<T> retain(boolean retain) {
    final int packetFlags = retain
                          ? this.packetFlags | MqttPublishPacket.RETAIN_FLAG
                          : this.packetFlags & ~MqttPublishPacket.RETAIN_FLAG;
    return new MqttPublishPacket<T>(packetFlags, this.topicName, this.packetId,
                                    this.payloadValue, this.payloadEncoder, this.payloadSize);
  }

  public MqttQoS qos() {
    return MqttQoS.from((this.packetFlags & MqttPublishPacket.QOS_MASK) >>> MqttPublishPacket.QOS_SHIFT);
  }

  public MqttPublishPacket<T> qos(MqttQoS qos) {
    final int packetFlags = this.packetFlags & ~MqttPublishPacket.QOS_MASK
                          | (qos.code << MqttPublishPacket.QOS_SHIFT) & MqttPublishPacket.QOS_MASK;
    return new MqttPublishPacket<T>(packetFlags, this.topicName, this.packetId,
                                    this.payloadValue, this.payloadEncoder, this.payloadSize);
  }

  public boolean dup() {
    return (this.packetFlags & MqttPublishPacket.DUP_FLAG) != 0;
  }

  public MqttPublishPacket<T> dup(boolean dup) {
    final int packetFlags = dup
                          ? this.packetFlags | MqttPublishPacket.DUP_FLAG
                          : this.packetFlags & ~MqttPublishPacket.DUP_FLAG;
    return new MqttPublishPacket<T>(packetFlags, this.topicName, this.packetId,
                                    this.payloadValue, this.payloadEncoder, this.payloadSize);
  }

  public String topicName() {
    return this.topicName;
  }

  public MqttPublishPacket<T> topicName(String topicName) {
    return new MqttPublishPacket<T>(this.packetFlags, topicName, this.packetId,
                                    this.payloadValue, this.payloadEncoder, this.payloadSize);
  }

  public boolean hasPacketId() {
    return ((this.packetFlags & MqttPublishPacket.QOS_MASK) >>> MqttPublishPacket.QOS_SHIFT) != 0;
  }

  public int packetId() {
    return this.packetId;
  }

  public MqttPublishPacket<T> packetId(int packetId) {
    return new MqttPublishPacket<T>(this.packetFlags, this.topicName, packetId,
                                    this.payloadValue, this.payloadEncoder, this.payloadSize);
  }

  public T payloadValue() {
    return this.payloadValue;
  }

  public <U> MqttPublishPacket<U> payloadValue(U payloadValue) {
    return new MqttPublishPacket<U>(this.packetFlags, this.topicName, this.packetId,
                                    payloadValue, this.payloadEncoder, this.payloadSize);
  }

  public Encoder<?, ?> payloadEncoder() {
    return this.payloadEncoder;
  }

  public int payloadSize() {
    return this.payloadSize;
  }

  public <U> MqttPublishPacket<U> payload(U payloadValue, Encoder<?, ?> payloadEncoder, int payloadSize) {
    return new MqttPublishPacket<U>(this.packetFlags, this.topicName, this.packetId,
                                    payloadValue, payloadEncoder, payloadSize);
  }

  public <U> MqttPublishPacket<U> payload(Encoder<?, ?> payloadEncoder, int payloadSize) {
    return new MqttPublishPacket<U>(this.packetFlags, this.topicName, this.packetId,
                                    null, payloadEncoder, payloadSize);
  }

  public <U> MqttPublishPacket<U> payload(ByteBuffer payloadValue) {
    return new MqttPublishPacket<U>(this.packetFlags, this.topicName, this.packetId,
                                    null, Binary.byteBufferWriter(payloadValue), payloadValue.remaining());
  }

  public MqttPublishPacket<Data> payload(Data payloadValue) {
    return new MqttPublishPacket<Data>(this.packetFlags, this.topicName, this.packetId,
                                       payloadValue.commit(), payloadValue.writer(), payloadValue.size());
  }

  public MqttPublishPacket<String> payload(String payloadValue) {
    Output<ByteBuffer> output = Utf8.encodedOutput(Binary.byteBufferOutput(payloadValue.length()));
    output = output.write(payloadValue);
    final ByteBuffer payloadData = output.bind();
    return new MqttPublishPacket<String>(this.packetFlags, this.topicName, this.packetId,
                                         payloadValue, Binary.byteBufferWriter(payloadData), payloadData.remaining());
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    int size = mqtt.sizeOfString(this.topicName);
    if (this.hasPacketId()) {
      size += 2;
    }
    size += this.payloadSize;
    return size;
  }

  @Override
  public Encoder<?, MqttPublishPacket<T>> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.publishPacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttPublishPacket<T>> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodePublishPacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttPublishPacket) {
      final MqttPublishPacket<?> that = (MqttPublishPacket<?>) other;
      return this.packetFlags == that.packetFlags && this.topicName.equals(that.topicName)
          && this.packetId == that.packetId
          && (this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue))
          && this.payloadSize == that.payloadSize;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttPublishPacket.hashSeed == 0) {
      MqttPublishPacket.hashSeed = Murmur3.seed(MqttPublishPacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        MqttPublishPacket.hashSeed, this.packetFlags), this.topicName.hashCode()), this.packetId),
        Murmur3.hash(this.payloadValue)), this.payloadSize));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttPublishPacket").write('.').write("create").write('(')
                   .debug(this.topicName).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    if (this.retain()) {
      output = output.write('.').write("retain").write('(').write("true").write(')');
    }
    if (this.qos().code != 0) {
      output = output.write('.').write("qos").write('(').debug(this.qos()).write(')');
    }
    if (this.dup()) {
      output = output.write('.').write("dup").write('(').write("true").write(')');
    }
    if (this.hasPacketId()) {
      output = output.write('.').write("packetId").write('(').debug(this.packetId).write(')');
    }
    if (this.payloadValue != null && this.payloadEncoder == Encoder.done() && this.payloadSize == 0) {
      output = output.write('.').write("payloadValue").write('(').debug(this.payloadValue).write(')');
    } else if (this.payloadValue != null || this.payloadEncoder != Encoder.done() || this.payloadSize != 0) {
      output = output.write('.').write("payload").write('(')
                     .debug(this.payloadValue).write(", ")
                     .debug(this.payloadEncoder).write(", ")
                     .debug(this.payloadSize).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int RETAIN_FLAG = 0x01;
  static final int QOS_MASK = 0x06;
  static final int QOS_SHIFT = 1;
  static final int DUP_FLAG = 0x08;

  public static <T> MqttPublishPacket<T> create(int packetFlags, String topicName, int packetId,
                                                T payloadValue, Encoder<?, ?> payloadEncoder, int payloadSize) {
    return new MqttPublishPacket<T>(packetFlags, topicName, packetId, payloadValue, payloadEncoder, payloadSize);
  }

  public static <T> MqttPublishPacket<T> create(String topicName, int packetId, T payloadValue,
                                                Encoder<?, ?> payloadEncoder, int payloadSize) {
    return new MqttPublishPacket<T>(0, topicName, packetId, payloadValue, payloadEncoder, payloadSize);
  }

  public static <T> MqttPublishPacket<T> create(String topicName, T payloadValue,
                                                Encoder<?, ?> payloadEncoder, int payloadSize) {
    return new MqttPublishPacket<T>(0, topicName, 0, payloadValue, payloadEncoder, payloadSize);
  }

  public static MqttPublishPacket<Object> create(String topicName) {
    return new MqttPublishPacket<Object>(0, topicName, 0, null, Encoder.done(), 0);
  }

}
