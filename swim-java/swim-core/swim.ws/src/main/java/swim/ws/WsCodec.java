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
import swim.codec.Binary;
import swim.codec.Transcoder;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public interface WsCodec<T> {

  Transcoder<? extends T> getDataPayloadTranscoder(WsOpcode frameType);

  Transcoder<?> getControlPayloadTranscoder(WsOpcode frameType);

  default Transcoder<?> getPayloadTranscoder(WsOpcode frameType) {
    if (frameType.isData()) {
      return this.getDataPayloadTranscoder(frameType);
    } else {
      return this.getControlPayloadTranscoder(frameType);
    }
  }

  default <U extends T> WsDataFrame<T> createDataFrame(WsOpcode frameType, @Nullable U value,
                                                       Transcoder<U> transcoder) {
    switch (frameType) {
      case TEXT:
        return WsTextFrame.of(value, Assume.conforms(transcoder));
      case BINARY:
        return WsBinaryFrame.of(value, Assume.conforms(transcoder));
      default:
        throw new IllegalArgumentException("Unsupported data frame: " + frameType.name());
    }
  }

  default <U> WsControlFrame<U> createControlFrame(WsOpcode frameType, @Nullable U value,
                                                   Transcoder<U> transcoder) {
    switch (frameType) {
      case CLOSE:
        return WsCloseFrame.of(value, transcoder);
      case PING:
        return WsPingFrame.of(value, transcoder);
      case PONG:
        return WsPongFrame.of(value, transcoder);
      default:
        throw new IllegalArgumentException("Unsupported control frame: " + frameType.name());
    }
  }

  static <T> WsCodec<T> of(Transcoder<? extends T> textTranscoder,
                           Transcoder<? extends T> binaryTranscoder) {
    return new WsTranscoder<T>(textTranscoder, binaryTranscoder);
  }

}

final class WsTranscoder<T> implements WsCodec<T>, ToSource {

  final Transcoder<? extends T> textTranscoder;
  final Transcoder<? extends T> binaryTranscoder;

  WsTranscoder(Transcoder<? extends T> textTranscoder,
               Transcoder<? extends T> binaryTranscoder) {
    this.textTranscoder = textTranscoder;
    this.binaryTranscoder = binaryTranscoder;
  }

  @Override
  public Transcoder<? extends T> getDataPayloadTranscoder(WsOpcode frameType) {
    switch (frameType) {
      case TEXT:
        return this.textTranscoder;
      case BINARY:
        return this.binaryTranscoder;
      default:
        throw new IllegalArgumentException("Unsupported data frame: " + frameType.name());
    }
  }

  @Override
  public Transcoder<?> getControlPayloadTranscoder(WsOpcode frameType) {
    switch (frameType) {
      case CLOSE:
        return WsStatus.transcoder();
      case PING:
      case PONG:
        return Binary.byteBufferTranscoder();
      default:
        throw new IllegalArgumentException("Unsupported control frame: " + frameType.name());
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsCodec", "of")
            .appendArgument(this.textTranscoder)
            .appendArgument(this.binaryTranscoder)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
