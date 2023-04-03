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
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Binary;
import swim.codec.Transcoder;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WsBinaryFrame<T> extends WsDataFrame<T> implements ToSource {

  final @Nullable T payload;
  final Transcoder<T> transcoder;

  WsBinaryFrame(@Nullable T payload, Transcoder<T> transcoder) {
    this.payload = payload;
    this.transcoder = transcoder;
  }

  @Override
  public WsOpcode frameType() {
    return WsOpcode.BINARY;
  }

  @Override
  public @Nullable T get() {
    return this.payload;
  }

  @Override
  public T getNonNull() {
    if (this.payload != null) {
      return this.payload;
    } else {
      throw new NullPointerException("null websocket payload");
    }
  }

  @Override
  public Transcoder<T> transcoder() {
    return this.transcoder;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsBinaryFrame<?>) {
      final WsBinaryFrame<?> that = (WsBinaryFrame<?>) other;
      return Objects.equals(this.payload, that.payload);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsBinaryFrame.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.payload)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsBinaryFrame", "of")
            .appendArgument(this.payload)
            .appendArgument(this.transcoder)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static <T> WsBinaryFrame<T> of(@Nullable T payload, Transcoder<T> transcoder) {
    return new WsBinaryFrame<T>(payload, transcoder);
  }

  public static WsBinaryFrame<byte[]> of(byte @Nullable [] payload) {
    return new WsBinaryFrame<byte[]>(payload, Binary.byteArrayTranscoder());
  }

  public static WsBinaryFrame<ByteBuffer> of(@Nullable ByteBuffer payload) {
    if (payload != null) {
      payload = payload.duplicate();
    }
    return new WsBinaryFrame<ByteBuffer>(payload, Binary.byteBufferTranscoder());
  }

}
