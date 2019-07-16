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

public final class MqttValue<T> extends MqttEntity<T> implements Debug {
  final T value;

  MqttValue(T value) {
    this.value = value;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public T get() {
    return this.value;
  }

  @Override
  public int mqttSize() {
    return -1;
  }

  @Override
  public Encoder<?, ?> mqttEncoder(MqttEncoder mqtt) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Encoder<?, ?> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttValue<?>) {
      final MqttValue<?> that = (MqttValue<?>) other;
      return (this.value == null ? that.value == null : this.value.equals(that.value));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttValue.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, Murmur3.hash(this.value)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttValue").write('.');
    if (this.value != null) {
      output = output.write("from").write('(').debug(this.value).write(')');
    } else {
      output = output.write("empty").write('(').write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static MqttValue<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> MqttValue<T> empty() {
    if (empty == null) {
      empty = new MqttValue<Object>(null);
    }
    return (MqttValue<T>) empty;
  }

  @SuppressWarnings("unchecked")
  public static <T> MqttValue<T> from(T value) {
    if (value == null) {
      return empty();
    } else {
      return new MqttValue<T>(value);
    }
  }
}
