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

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Codec;
import swim.codec.Text;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class WsTextFrame<T> extends WsDataFrame<T> implements WriteSource {

  final @Nullable T payload;
  final Codec<T> codec;

  WsTextFrame(@Nullable T payload, Codec<T> codec) {
    this.payload = payload;
    this.codec = codec;
  }

  @Override
  public WsOpcode frameType() {
    return WsOpcode.TEXT;
  }

  @Override
  public @Nullable T get() {
    return this.payload;
  }

  @Override
  public T getNonNull() {
    if (this.payload == null) {
      throw new NullPointerException("null websocket payload");
    }
    return this.payload;
  }

  @Override
  public Codec<T> codec() {
    return this.codec;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsTextFrame<?> that) {
      return Objects.equals(this.payload, that.payload);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsTextFrame.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.payload)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsTextFrame", "of")
            .appendArgument(this.payload)
            .appendArgument(this.codec)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static <T> WsTextFrame<T> of(@Nullable T payload, Codec<T> codec) {
    return new WsTextFrame<T>(payload, codec);
  }

  public static WsTextFrame<String> of(@Nullable String payload) {
    return new WsTextFrame<String>(payload, Text.stringCodec());
  }

}
