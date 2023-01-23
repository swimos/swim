// Copyright 2015-2023 Swim.inc
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

public final class WsPongFrame<P, T> extends WsControlFrame<P, T> implements Debug {

  final P payloadValue;
  final Encoder<?, ?> payloadEncoder;

  WsPongFrame(P payloadValue, Encoder<?, ?> payloadEncoder) {
    this.payloadValue = payloadValue;
    this.payloadEncoder = payloadEncoder;
  }

  @Override
  public WsOpcode frameType() {
    return WsOpcode.PONG;
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
    } else if (other instanceof WsPongFrame<?, ?>) {
      final WsPongFrame<?, ?> that = (WsPongFrame<?, ?>) other;
      return this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WsPongFrame.hashSeed == 0) {
      WsPongFrame.hashSeed = Murmur3.seed(WsPongFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(WsPongFrame.hashSeed, Murmur3.hash(this.payloadValue)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WsPongFrame").write('.').write("create").write('(')
                   .debug(this.payloadValue).write(", ")
                   .debug(this.payloadEncoder).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <P, T> WsPongFrame<P, T> empty() {
    return new WsPongFrame<P, T>(null, Encoder.done());
  }

  public static <P, T> WsPongFrame<P, T> create(P payloadValue, Encoder<?, ?> payloadEncoder) {
    return new WsPongFrame<P, T>(payloadValue, payloadEncoder);
  }

  @SuppressWarnings("unchecked")
  public static <P, T> WsPongFrame<P, T> create(P payloadValue) {
    if (payloadValue instanceof Data) {
      return (WsPongFrame<P, T>) WsPongFrame.create((Data) payloadValue);
    } else {
      return new WsPongFrame<P, T>(payloadValue, Encoder.done());
    }
  }

  public static <T> WsPongFrame<ByteBuffer, T> create(ByteBuffer payloadValue) {
    return new WsPongFrame<ByteBuffer, T>(payloadValue.duplicate(), Binary.byteBufferWriter(payloadValue));
  }

  public static <T> WsPongFrame<Data, T> create(Data payloadValue) {
    return new WsPongFrame<Data, T>(payloadValue, payloadValue.writer());
  }

}
