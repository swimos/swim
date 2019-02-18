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

package swim.ws;

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.util.Murmur3;

public final class WsValue<T> extends WsData<T> implements Debug {
  final T value;

  WsValue(T value) {
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
  public WsOpcode opcode() {
    return WsOpcode.INVALID;
  }

  @Override
  public Object payload() {
    return this.value;
  }

  @Override
  public Encoder<?, ?> contentEncoder(WsEncoder ws) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Encoder<?, ?> encodeContent(OutputBuffer<?> output, WsEncoder ws) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsValue<?>) {
      final WsValue<?> that = (WsValue<?>) other;
      return (this.value == null ? that.value == null : this.value.equals(that.value));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(WsValue.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, Murmur3.hash(this.value)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("WsValue").write('.').write("from").write('(')
        .debug(this.value).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static <T> WsValue<T> from(T value) {
    return new WsValue<T>(value);
  }
}
