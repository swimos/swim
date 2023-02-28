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
import swim.codec.Encode;
import swim.codec.Transcoder;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WsContinuationFrame<T> extends WsFrame<T> implements ToSource {

  final WsDataFrame<T> frame;
  final Encode<?> encodePayload;
  final long offset;

  WsContinuationFrame(WsDataFrame<T> frame, Encode<?> encodePayload, long offset) {
    this.frame = frame;
    this.encodePayload = encodePayload;
    this.offset = offset;
  }

  @Override
  public WsOpcode frameType() {
    return this.frame.frameType();
  }

  @Override
  public @Nullable T get() {
    return this.frame.get();
  }

  @Override
  public T getNonNull() {
    return this.frame.getNonNull();
  }

  @Override
  public Transcoder<T> transcoder() {
    return this.frame.transcoder();
  }

  public WsDataFrame<T> frame() {
    return this.frame;
  }

  public Encode<?> encodePayload() {
    return this.encodePayload;
  }

  public long offset() {
    return this.offset;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsContinuationFrame<?>) {
      final WsContinuationFrame<?> that = (WsContinuationFrame<?>) other;
      return this.frame.equals(that.frame)
          && this.encodePayload.equals(that.encodePayload)
          && this.offset == that.offset;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsContinuationFrame.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
       this.frame.hashCode()), this.encodePayload.hashCode()),
       Murmur3.hash(this.offset)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsContinuationFrame", "of")
            .appendArgument(this.frame)
            .appendArgument(this.encodePayload)
            .appendArgument(this.offset)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static <T> WsContinuationFrame<T> of(WsDataFrame<T> frame,
                                              Encode<?> encodePayload,
                                              long offset) {
    return new WsContinuationFrame<T>(frame, encodePayload, offset);
  }

}
