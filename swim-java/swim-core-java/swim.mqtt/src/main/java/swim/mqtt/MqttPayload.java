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
import swim.codec.Binary;
import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.util.Murmur3;

public final class MqttPayload<T> extends MqttEntity<T> implements Debug {
  final T value;
  final Encoder<?, ?> content;
  final int length;

  MqttPayload(T value, Encoder<?, ?> content, int length) {
    this.value = value;
    this.content = content;
    this.length = length;
  }

  public boolean isDefined() {
    return this.value != null;
  }

  public T get() {
    return this.value;
  }

  public int mqttSize() {
    return this.length;
  }

  @Override
  public Encoder<?, ?> mqttEncoder(MqttEncoder mqtt) {
    return this.content;
  }

  @Override
  public Encoder<?, ?> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return this.content.pull(output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttPayload) {
      final MqttPayload<?> that = (MqttPayload<?>) other;
      return (this.value == null ? that.value == null : this.value.equals(that.value))
          && this.content.equals(that.content) && this.length == that.length;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttPayload.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.value)), this.content.hashCode()), this.length));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttPayload").write('.');
    if (this.value == null && this.content.isDone() && this.length == 0) {
      output = output.write("empty").write('(').write(')');
    } else {
      output = output.write("from").write('(');
      if (this.value != null) {
        output.debug(this.value).write(", ");
      }
      output.debug(this.content).write(", ").debug(this.length).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static MqttPayload<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> MqttPayload<T> empty() {
    if (empty == null) {
      empty = new MqttPayload<Object>(null, Encoder.done(), 0);
    }
    return (MqttPayload<T>) empty;
  }

  public static <T> MqttPayload<T> from(T value, Encoder<?, ?> content, int length) {
    return new MqttPayload<T>(value, content, length);
  }

  public static <T> MqttPayload<T> from(Encoder<?, ?> content, int length) {
    return new MqttPayload<T>(null, content, length);
  }

  public static <T> MqttPayload<T> from(ByteBuffer data) {
    return new MqttPayload<T>(null, Binary.byteBufferWriter(data), data.remaining());
  }

  public static MqttPayload<String> from(String content) {
    Output<ByteBuffer> output = Utf8.encodedOutput(Binary.byteBufferOutput(content.length()));
    output = output.write(content);
    final ByteBuffer data = output.bind();
    return new MqttPayload<String>(content, Binary.byteBufferWriter(data), data.remaining());
  }
}
