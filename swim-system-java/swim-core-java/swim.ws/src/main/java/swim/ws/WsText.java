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
import swim.codec.Utf8;
import swim.util.Murmur3;

public final class WsText<T> extends WsData<T> implements Debug {
  final T value;
  final Encoder<?, ?> content;

  WsText(T value, Encoder<?, ?> content) {
    this.value = value;
    this.content = content;
  }

  @Override
  public boolean isDefined() {
    return this.value != null;
  }

  @Override
  public T get() {
    return this.value;
  }

  @Override
  public WsOpcode opcode() {
    return WsOpcode.TEXT;
  }

  @Override
  public Object payload() {
    return this.value;
  }

  @Override
  public Encoder<?, ?> contentEncoder(WsEncoder ws) {
    return this.content;
  }

  @Override
  public Encoder<?, ?> encodeContent(OutputBuffer<?> output, WsEncoder ws) {
    return this.content.pull(output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsText<?>) {
      final WsText<?> that = (WsText<?>) other;
      return (this.value == null ? that.value == null : this.value.equals(that.value));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(WsText.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, Murmur3.hash(this.value)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("WsText").write('.').write("from").write('(');
    if (this.value != null) {
      output = output.debug(this.value).write(", ");
    }
    output = output.debug(this.content).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static <T> WsText<T> from(T value, Encoder<?, ?> content) {
    return new WsText<T>(value, content);
  }

  public static <T> WsText<T> from(Encoder<?, ?> content) {
    return new WsText<T>(null, content);
  }

  public static WsText<String> from(String value) {
    return new WsText<String>(value, Utf8.stringWriter(value));
  }
}
