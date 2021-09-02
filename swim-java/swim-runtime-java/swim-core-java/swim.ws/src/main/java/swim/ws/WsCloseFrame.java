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

package swim.ws;

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public final class WsCloseFrame<P, T> extends WsControlFrame<P, T> implements Debug {

  final P payloadValue;
  final Encoder<?, ?> payloadEncoder;

  WsCloseFrame(P payloadValue, Encoder<?, ?> payloadEncoder) {
    this.payloadValue = payloadValue;
    this.payloadEncoder = payloadEncoder;
  }

  @Override
  public WsOpcode frameType() {
    return WsOpcode.CLOSE;
  }

  @Override
  public P payloadValue() {
    return this.payloadValue;
  }

  @Override
  public Encoder<?, ?> payloadEncoder(WsEncoder ws) {
    return this.payloadEncoder;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsCloseFrame<?, ?>) {
      final WsCloseFrame<?, ?> that = (WsCloseFrame<?, ?>) other;
      return this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WsCloseFrame.hashSeed == 0) {
      WsCloseFrame.hashSeed = Murmur3.seed(WsCloseFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(WsCloseFrame.hashSeed, Murmur3.hash(this.payloadValue)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsCloseFrame").write('.').write("create").write('(')
                   .debug(this.payloadValue).write(", ")
                   .debug(this.payloadEncoder).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <P, T> WsCloseFrame<P, T> empty() {
    return new WsCloseFrame<P, T>(null, Encoder.done());
  }

  public static <P, T> WsCloseFrame<P, T> create(P payloadValue, Encoder<?, ?> payloadEncoder) {
    return new WsCloseFrame<P, T>(payloadValue, payloadEncoder);
  }

  @SuppressWarnings("unchecked")
  public static <P, T> WsCloseFrame<P, T> create(P payloadValue) {
    if (payloadValue instanceof WsStatus) {
      return (WsCloseFrame<P, T>) WsCloseFrame.create((WsStatus) payloadValue);
    } else {
      return new WsCloseFrame<P, T>(payloadValue, Encoder.done());
    }
  }

  public static <T> WsCloseFrame<WsStatus, T> create(WsStatus status) {
    return new WsCloseFrame<WsStatus, T>(status, status.encoder());
  }

  public static <T> WsCloseFrame<WsStatus, T> create(int code, String reason) {
    return WsCloseFrame.create(WsStatus.create(code, reason));
  }

  public static <T> WsCloseFrame<WsStatus, T> create(int code) {
    return WsCloseFrame.create(WsStatus.create(code));
  }

}
