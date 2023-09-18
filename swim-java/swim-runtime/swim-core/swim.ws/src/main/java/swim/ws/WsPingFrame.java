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

import java.nio.ByteBuffer;
import swim.codec.Binary;
import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Data;
import swim.util.Murmur3;

public final class WsPingFrame<P, T> extends WsControlFrame<P, T> implements Debug {

  final P payloadValue;
  final Encoder<?, ?> payloadEncoder;

  WsPingFrame(P payloadValue, Encoder<?, ?> payloadEncoder) {
    this.payloadValue = payloadValue;
    this.payloadEncoder = payloadEncoder;
  }

  @Override
  public WsOpcode frameType() {
    return WsOpcode.PING;
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
    } else if (other instanceof WsPingFrame<?, ?>) {
      final WsPingFrame<?, ?> that = (WsPingFrame<?, ?>) other;
      return this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WsPingFrame.hashSeed == 0) {
      WsPingFrame.hashSeed = Murmur3.seed(WsPingFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(WsPingFrame.hashSeed, Murmur3.hash(this.payloadValue)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsPingFrame").write('.').write("create").write('(')
                   .debug(this.payloadValue).write(", ")
                   .debug(this.payloadEncoder).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <P, T> WsPingFrame<P, T> empty() {
    return new WsPingFrame<P, T>(null, Encoder.done());
  }

  public static <P, T> WsPingFrame<P, T> create(P payloadValue, Encoder<?, ?> payloadEncoder) {
    return new WsPingFrame<P, T>(payloadValue, payloadEncoder);
  }

  @SuppressWarnings("unchecked")
  public static <P, T> WsPingFrame<P, T> create(P payloadValue) {
    if (payloadValue instanceof Data) {
      return (WsPingFrame<P, T>) WsPingFrame.create((Data) payloadValue);
    } else {
      return new WsPingFrame<P, T>(payloadValue, Encoder.done());
    }
  }

  public static <T> WsPingFrame<ByteBuffer, T> create(ByteBuffer payloadValue) {
    return new WsPingFrame<ByteBuffer, T>(payloadValue.duplicate(), Binary.byteBufferWriter(payloadValue));
  }

  public static <T> WsPingFrame<Data, T> create(Data payloadValue) {
    return new WsPingFrame<Data, T>(payloadValue, payloadValue.writer());
  }

}
