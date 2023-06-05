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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Codec;
import swim.codec.Decode;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WsFragment<T> extends WsFrame<T> implements ToSource {

  final WsOpcode frameType;
  final Codec<T> codec;
  final Decode<T> decodePayload;

  WsFragment(WsOpcode frameType, Codec<T> codec, Decode<T> decodePayload) {
    this.frameType = frameType;
    this.codec = codec;
    this.decodePayload = decodePayload;
  }

  @Override
  public boolean fin() {
    return false;
  }

  @Override
  public WsOpcode frameType() {
    return this.frameType;
  }

  @Override
  public @Nullable T get() {
    return this.decodePayload.getUnchecked();
  }

  @Override
  public T getNonNull() {
    return this.decodePayload.getNonNullUnchecked();
  }

  @Override
  public Codec<T> codec() {
    return this.codec;
  }

  public Decode<T> decodePayload() {
    return this.decodePayload;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsFragment<?> that) {
      return this.frameType.equals(that.frameType)
          && this.codec.equals(that.codec)
          && this.decodePayload.equals(that.decodePayload);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsFragment.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
       this.frameType.hashCode()), this.codec.hashCode()),
       this.decodePayload.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsFragment", "of")
            .appendArgument(this.frameType)
            .appendArgument(this.codec)
            .appendArgument(this.decodePayload)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static <T> WsFragment<T> of(WsOpcode frameType, Codec<T> codec,
                                     Decode<T> decodePayload) {
    return new WsFragment<T>(frameType, codec, decodePayload);
  }

}
