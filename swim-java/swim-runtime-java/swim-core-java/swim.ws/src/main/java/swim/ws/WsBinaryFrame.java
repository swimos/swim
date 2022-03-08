// Copyright 2015-2022 Swim.inc
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

public final class WsBinaryFrame<T> extends WsDataFrame<T> implements Debug {

  final T payloadValue;
  final Encoder<?, ?> payloadEncoder;

  WsBinaryFrame(T payloadValue, Encoder<?, ?> payloadEncoder) {
    this.payloadValue = payloadValue;
    this.payloadEncoder = payloadEncoder;
  }

  @Override
  public WsOpcode frameType() {
    return WsOpcode.BINARY;
  }

  @Override
  public T payloadValue() {
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
    } else if (other instanceof WsBinaryFrame<?>) {
      final WsBinaryFrame<?> that = (WsBinaryFrame<?>) other;
      return this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WsBinaryFrame.hashSeed == 0) {
      WsBinaryFrame.hashSeed = Murmur3.seed(WsBinaryFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(WsBinaryFrame.hashSeed, Murmur3.hash(this.payloadValue)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsBinaryFrame").write('.').write("create").write('(')
                   .debug(this.payloadValue).write(", ")
                   .debug(this.payloadEncoder).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <T> WsBinaryFrame<T> empty() {
    return new WsBinaryFrame<T>(null, Encoder.done());
  }

  public static <T> WsBinaryFrame<T> create(T payloadValue, Encoder<?, ?> payloadEncoder) {
    return new WsBinaryFrame<T>(payloadValue, payloadEncoder);
  }

  public static WsBinaryFrame<ByteBuffer> create(ByteBuffer payloadValue) {
    return new WsBinaryFrame<ByteBuffer>(payloadValue.duplicate(), Binary.byteBufferWriter(payloadValue));
  }

  public static WsBinaryFrame<Data> create(Data payloadValue) {
    return new WsBinaryFrame<Data>(payloadValue, payloadValue.writer());
  }

  public static <T> WsBinaryFrame<T> create(Encoder<?, ?> payloadEncoder) {
    return new WsBinaryFrame<T>(null, payloadEncoder);
  }

}
