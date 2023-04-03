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
import swim.codec.Decode;
import swim.codec.Transcoder;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WsFragment<T> extends WsFrame<T> implements ToSource {

  final WsOpcode frameType;
  final Transcoder<T> transcoder;
  final Decode<T> decodePayload;

  WsFragment(WsOpcode frameType, Transcoder<T> transcoder, Decode<T> decodePayload) {
    this.frameType = frameType;
    this.transcoder = transcoder;
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
  public Transcoder<T> transcoder() {
    return this.transcoder;
  }

  public Decode<T> decodePayload() {
    return this.decodePayload;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsFragment<?>) {
      final WsFragment<?> that = (WsFragment<?>) other;
      return this.frameType.equals(that.frameType)
          && this.transcoder.equals(that.transcoder)
          && this.decodePayload.equals(that.decodePayload);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsFragment.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
       this.frameType.hashCode()), this.transcoder.hashCode()),
       this.decodePayload.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsFragment", "of")
            .appendArgument(this.frameType)
            .appendArgument(this.transcoder)
            .appendArgument(this.decodePayload)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static <T> WsFragment<T> of(WsOpcode frameType, Transcoder<T> transcoder,
                                     Decode<T> decodePayload) {
    return new WsFragment<T>(frameType, transcoder, decodePayload);
  }

}
