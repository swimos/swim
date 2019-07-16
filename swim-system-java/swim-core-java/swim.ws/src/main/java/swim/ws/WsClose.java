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

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(WsClose.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, Murmur3.hash(this.payload)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("WsClose").write('.').write("from").write('(')
        .debug(this.payload).write(", ").debug(this.content).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static <P, T> WsClose<P, T> empty() {
    return new WsClose<P, T>(null, Encoder.done());
  }

  public static <P, T> WsClose<P, T> from(P payload, Encoder<?, ?> content) {
    return new WsClose<P, T>(payload, content);
  }

  @SuppressWarnings("unchecked")
  public static <P, T> WsClose<P, T> from(P payload) {
    if (payload instanceof WsStatus) {
      return (WsClose<P, T>) from((WsStatus) payload);
    } else {
      return new WsClose<P, T>(payload, Encoder.done());
    }
  }

  public static <T> WsClose<WsStatus, T> from(WsStatus status) {
    return new WsClose<WsStatus, T>(status, status.encoder());
  }

  public static <T> WsClose<WsStatus, T> from(int code, String reason) {
    return from(WsStatus.from(code, reason));
  }

  public static <T> WsClose<WsStatus, T> from(int code) {
    return from(WsStatus.from(code));
  }
}
