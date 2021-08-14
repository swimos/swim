// Copyright 2015-2021 Swim inc.
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

public final class WsClose<P, T> extends WsControl<P, T> implements Debug {

  final P payload;
  final Encoder<?, ?> content;

  WsClose(P payload, Encoder<?, ?> content) {
    this.payload = payload;
    this.content = content;
  }

  @Override
  public WsOpcode opcode() {
    return WsOpcode.CLOSE;
  }

  @Override
  public P payload() {
    return this.payload;
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
    } else if (other instanceof WsClose<?, ?>) {
      final WsClose<?, ?> that = (WsClose<?, ?>) other;
      return (this.payload == null ? that.payload == null : this.payload.equals(that.payload));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WsClose.hashSeed == 0) {
      WsClose.hashSeed = Murmur3.seed(WsClose.class);
    }
    return Murmur3.mash(Murmur3.mix(WsClose.hashSeed, Murmur3.hash(this.payload)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsClose").write('.').write("create").write('(')
                   .debug(this.payload).write(", ").debug(this.content).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <P, T> WsClose<P, T> empty() {
    return new WsClose<P, T>(null, Encoder.done());
  }

  public static <P, T> WsClose<P, T> create(P payload, Encoder<?, ?> content) {
    return new WsClose<P, T>(payload, content);
  }

  @SuppressWarnings("unchecked")
  public static <P, T> WsClose<P, T> create(P payload) {
    if (payload instanceof WsStatus) {
      return (WsClose<P, T>) WsClose.create((WsStatus) payload);
    } else {
      return new WsClose<P, T>(payload, Encoder.done());
    }
  }

  public static <T> WsClose<WsStatus, T> create(WsStatus status) {
    return new WsClose<WsStatus, T>(status, status.encoder());
  }

  public static <T> WsClose<WsStatus, T> create(int code, String reason) {
    return WsClose.create(WsStatus.create(code, reason));
  }

  public static <T> WsClose<WsStatus, T> create(int code) {
    return WsClose.create(WsStatus.create(code));
  }

}
