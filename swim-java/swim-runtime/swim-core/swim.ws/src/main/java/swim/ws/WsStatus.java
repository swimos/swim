// Copyright 2015-2023 Nstream, inc.
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
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.util.Murmur3;

public final class WsStatus implements Debug {

  final int code;
  final String reason;

  WsStatus(int code, String reason) {
    this.code = code;
    this.reason = reason;
  }

  public int code() {
    return this.code;
  }

  public String reason() {
    return this.reason;
  }

  public Encoder<?, WsStatus> encoder() {
    return new WsStatusEncoder(this);
  }

  public Encoder<?, WsStatus> encode(OutputBuffer<?> output) {
    return WsStatusEncoder.encode(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsStatus) {
      final WsStatus that = (WsStatus) other;
      return this.code == that.code && this.reason.equals(that.reason);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WsStatus.hashSeed == 0) {
      WsStatus.hashSeed = Murmur3.seed(WsStatus.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(WsStatus.hashSeed,
        this.code), this.reason.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsStatus").write('.').write("create").write('(').debug(this.code);
    if (!this.reason.isEmpty()) {
      output = output.write(", ").debug(this.reason);
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static WsStatus create(int code, String reason) {
    return new WsStatus(code, reason);
  }

  public static WsStatus create(int code) {
    return new WsStatus(code, "");
  }

  public static Decoder<WsStatus> decoder() {
    return new WsStatusDecoder();
  }

  public static Decoder<WsStatus> decode(InputBuffer input) {
    return WsStatusDecoder.decode(input);
  }

}
