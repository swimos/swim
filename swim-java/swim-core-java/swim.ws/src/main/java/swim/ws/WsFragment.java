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
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;

public final class WsFragment<T> extends WsFrame<T> implements Debug {
  final WsOpcode opcode;
  final Decoder<T> content;

  WsFragment(WsOpcode opcode, Decoder<T> content) {
    this.opcode = opcode;
    this.content = content;
  }

  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public T get() {
    return this.content.bind();
  }

  @Override
  public WsOpcode opcode() {
    return this.opcode;
  }

  @Override
  public Object payload() {
    return this.content.bind();
  }

  @Override
  public Encoder<?, ?> contentEncoder(WsEncoder ws) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Encoder<?, ?> encodeContent(OutputBuffer<?> output, WsEncoder ws) {
    throw new UnsupportedOperationException();
  }

  public Decoder<T> contentDecoder() {
    return this.content;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("WsFragment").write('.').write("from").write('(')
        .debug(this.opcode).write(", ").debug(this.content).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <T> WsFragment<T> from(WsOpcode opcode, Decoder<T> content) {
    return new WsFragment<T>(opcode, content);
  }
}
