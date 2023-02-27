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
import swim.codec.Text;
import swim.codec.Transcoder;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WsPingFrame<T> extends WsControlFrame<T> implements ToSource {

  final @Nullable T value;
  final Transcoder<T> transcoder;

  WsPingFrame(@Nullable T value, Transcoder<T> transcoder) {
    this.value = value;
    this.transcoder = transcoder;
  }

  @Override
  public WsOpcode frameType() {
    return WsOpcode.PING;
  }

  @Override
  public @Nullable T get() {
    return this.value;
  }

  @Override
  public T getNonNull() {
    if (this.value != null) {
      return this.value;
    } else {
      throw new NullPointerException("Null websocket payload");
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
    } else if (other instanceof WsPingFrame<?>) {
      final WsPingFrame<?> that = (WsPingFrame<?>) other;
      return Objects.equals(this.value, that.value);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsPingFrame.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.value)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsPingFrame", "of")
            .appendArgument(this.value)
            .appendArgument(this.transcoder)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static <T> WsPingFrame<T> empty() {
    return new WsPingFrame<T>(null, Binary.blankTranscoder());
  }

  public static <T> WsPingFrame<T> of(@Nullable T value, Transcoder<T> transcoder) {
    return new WsPingFrame<T>(value, transcoder);
  }

  public static WsPingFrame<String> of(@Nullable String value) {
    return new WsPingFrame<String>(value, Text.transcoder());
  }

  public static WsPingFrame<byte[]> of(byte @Nullable [] value) {
    return new WsPingFrame<byte[]>(value, Binary.byteArrayTranscoder());
  }

  public static WsPingFrame<ByteBuffer> of(@Nullable ByteBuffer value) {
    if (value != null) {
      value = value.duplicate();
    }
    return new WsPingFrame<ByteBuffer>(value, Binary.byteBufferTranscoder());
  }

}
